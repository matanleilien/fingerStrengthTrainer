// Generates workout plans based on assessment results, current cycle, and user level
import { HOLDS, getHoldsByDifficultyRange, getHoldById } from './holds';
import { EXERCISES, getExercisesForLevel } from './exercises';
import { CYCLE_CONFIG, getCycleIntensity } from './periodization';
import { applyAdjustmentToExercise } from '../utils/failureAdjustment';
import { getBandConfig, defaultBandAssistance } from '../utils/bandAssistance';
import { getBandAssistance } from '../utils/storage';
import { TEN_MINUTE_SEQUENCES } from './trainingGuide';

const LEVELS = {
  1: { name: 'Beginner', maxHoldDifficulty: 4, baseHangTime: 10, baseReps: 3 },
  2: { name: 'Intermediate', maxHoldDifficulty: 7, baseHangTime: 15, baseReps: 5 },
  3: { name: 'Advanced', maxHoldDifficulty: 10, baseHangTime: 20, baseReps: 7 },
};

export { LEVELS };

export function generateWorkout(userProfile, cycleInfo, assessmentResults, failureAdjustments = null) {
  const { level } = userProfile;
  const { cycle, config, microCycleDay } = cycleInfo;

  // Off cycle — no workout
  if (cycle === 'off') {
    return {
      type: 'off',
      message: 'Off cycle — no training today. Go climb!',
      exercises: [],
    };
  }

  const intensity = getCycleIntensity(config, microCycleDay);
  const availableExercises = getExercisesForLevel(level);

  // Build exercise sequence from official Metolius 10-minute sequences
  const exercises = buildSequenceWorkout(level, availableExercises, intensity, cycle);

  // Expand one-handed holds (and oneArm sequence exercises) into separate L/R exercises
  const expandedExercises = expandOneHandedExercises(exercises);

  // Apply failure adjustments to reduce difficulty where user has struggled
  const adjustedExercises = failureAdjustments
    ? expandedExercises.map(ex => applyAdjustmentToExercise(ex, failureAdjustments))
    : expandedExercises;

  return {
    type: cycle,
    microCycleDay,
    intensity: Math.round(intensity * 100),
    sequenceLevel: level >= 3 ? 'Advanced' : level >= 2 ? 'Intermediate' : 'Entry Level',
    warmUpMinutes: 15,
    coolDownMinutes: 15,
    exercises: adjustedExercises,
    totalSets: adjustedExercises.reduce((sum, e) => sum + (e.sets || 1), 0),
    estimatedMinutes: 10 + 30, // 10-min sequence + warm-up/cool-down
  };
}

// For one-handed holds (or oneArm sequence exercises), duplicate: once R, once L
// Also annotates with the user's current band assistance level
function expandOneHandedExercises(exercises) {
  const bandAssistance = getBandAssistance() || defaultBandAssistance();
  const expanded = [];
  for (const ex of exercises) {
    const hold = getHoldById(ex.holdId);
    const isOneArm = hold?.oneHanded || ex.oneArm;
    if (isOneArm) {
      for (const hand of ['right', 'left']) {
        const bandLevel = bandAssistance[hand] || 'none';
        const bandConfig = getBandConfig(bandLevel);
        const needsBand = bandLevel !== 'none';
        expanded.push({
          ...ex,
          hand,
          holdName: `${ex.holdName} (${hand === 'right' ? 'R' : 'L'})`,
          bandLevel,
          bandConfig,
          notes: needsBand
            ? `${hand.toUpperCase()} hand — ${bandConfig.label}: ${bandConfig.description}`
            : ex.notes
              ? `${ex.notes} — ${hand.toUpperCase()} hand`
              : `${hand.toUpperCase()} hand`,
          hangTime: needsBand
            ? Math.max(ex.hangTime || 10, bandConfig.targetHangTime)
            : ex.hangTime,
        });
      }
    } else {
      expanded.push({ ...ex, hand: null, bandLevel: null });
    }
  }
  return expanded;
}

// Intensity multipliers per cycle — scale hang times from the official sequence
const CYCLE_HANG_MULTIPLIERS = {
  conditioning: 0.70,  // 60-70% — build base, longer rests
  load:         0.85,  // 70-85% — volume phase
  recovery:     0.50,  // 50%    — active recovery
  peak:         1.00,  // 80-100% — max intensity
};

// Convert one sequence minute into a workout exercise object
function sequenceMinuteToExercise(minute, allExercises, intensityMultiplier) {
  const primaryHoldId = minute.holdIds[0] || 1; // fallback to outer jug
  const primaryHold = getHoldById(primaryHoldId);

  // Scale hang time by intensity; to-failure exercises get a generous default
  const baseDuration = minute.duration || (minute.toFailure ? 30 : 0);
  const hangTime = baseDuration > 0
    ? Math.max(5, Math.round(baseDuration * intensityMultiplier))
    : 0;

  // Scale pull-up count (min 1 if specified)
  const reps = minute.pullUps
    ? Math.max(1, Math.round(minute.pullUps * intensityMultiplier))
    : (hangTime > 0 ? 1 : 1);

  // Rest = remainder of the minute, minimum 15s
  const restTime = Math.max(15, 60 - hangTime);

  const exercise = allExercises.find(e => e.id === minute.exerciseId)
    || allExercises.find(e => e.id === 'dead_hang');

  // Build hold name: show all holds involved for offset/multi-hold exercises
  const holdNames = minute.holdIds
    .map(id => getHoldById(id)?.name || `#${id}`)
    .join(' & ');

  const toFailureNote = minute.toFailure ? ' — hang to failure' : '';
  const extraNote = minute.notes ? ` | ${minute.notes}` : '';

  return {
    exercise,
    holdId: primaryHoldId,
    altHoldIds: minute.holdIds.slice(1),
    holdName: holdNames,
    hangTime,
    restTime,
    sets: 1,
    reps,
    minuteNum: minute.min,
    toFailure: minute.toFailure || false,
    oneArm: minute.oneArm || false,
    notes: minute.description + toFailureNote + extraNote,
  };
}

// Build workout from the official Metolius 10-minute sequence for the user's level
function buildSequenceWorkout(level, allExercises, intensity, cycle) {
  const sequenceKey = level >= 3 ? 'advanced' : level >= 2 ? 'intermediate' : 'entry';
  const sequence = TEN_MINUTE_SEQUENCES[sequenceKey];
  const multiplier = CYCLE_HANG_MULTIPLIERS[cycle] ?? intensity;

  return sequence.minutes.map(minute =>
    sequenceMinuteToExercise(minute, allExercises, multiplier)
  );
}

function estimateWorkoutDuration(exercises) {
  let totalSeconds = 0;
  for (const ex of exercises) {
    const sets = ex.sets || 1;
    const reps = ex.reps || 1;
    const workTime = ex.hangTime > 0 ? ex.hangTime * reps : 5 * reps; // ~5s per pull-up
    const rest = ex.restTime * (reps - 1) + ex.restTime * (sets - 1) * 1.5;
    totalSeconds += (workTime + rest) * sets;
  }
  return Math.round(totalSeconds / 60) + 30; // +30 for warm-up/cool-down
}

// Assessment workout generator
export function generateAssessment() {
  return {
    type: 'assessment',
    warmup: [
      {
        id: 'warmup_hang_jug',
        name: 'Warm-Up — Easy Jug Hang',
        holdId: 1,
        holdName: '#1 Outer Jugs',
        description: 'Easy 10-second hang on the jug. Slight elbow bend, relax your shoulders.',
        duration: 10,
      },
      {
        id: 'warmup_hang_sloper',
        name: 'Warm-Up — Flat Sloper Hang',
        holdId: 2,
        holdName: '#2 Flat Slopers (55mm)',
        description: '8-second hang on the flat sloper. Open-hand grip, stay relaxed.',
        duration: 8,
      },
      {
        id: 'warmup_hang_edge',
        name: 'Warm-Up — Medium Edge Hang',
        holdId: 5,
        holdName: '#5 Edges (25mm)',
        description: '8-second hang on the medium edge. Easy effort, just getting blood flowing.',
        duration: 8,
      },
    ],
    exercises: [
      {
        id: 'max_hang_jug',
        name: 'Max Hang — #1 Outer Jugs',
        exercise: { id: 'dead_hang', name: 'Dead Hang' },
        holdId: 1,
        holdName: '#1 Outer Jugs',
        description: 'Hang as long as you can on the jug. Open-hand grip, slight elbow bend.',
        metric: 'time',
        unit: 'seconds',
      },
      {
        id: 'max_hang_edge',
        name: 'Max Hang — #5 Edges (25mm)',
        exercise: { id: 'dead_hang', name: 'Dead Hang' },
        holdId: 5,
        holdName: '#5 Edges (25mm)',
        description: 'Hang as long as you can on the medium edge. Open-hand grip.',
        metric: 'time',
        unit: 'seconds',
      },
      {
        id: 'max_hang_pocket',
        name: 'Max Hang — #4 3-Finger Pockets (30mm)',
        exercise: { id: 'dead_hang', name: 'Dead Hang' },
        holdId: 4,
        holdName: '#4 3-Finger Pockets (30mm)',
        description: 'Hang as long as you can on the 3-finger pocket.',
        metric: 'time',
        unit: 'seconds',
      },
      {
        id: 'repeater_test',
        name: 'Repeater Test — #1 Outer Jugs',
        exercise: { id: 'repeaters', name: 'Repeaters' },
        holdId: 1,
        holdName: '#1 Outer Jugs',
        description: '7s on / 3s off on the jug. Count how many full reps you complete before failure.',
        metric: 'reps',
        unit: 'reps',
        hangTime: 7,
        restTime: 3,
      },
      {
        id: 'repeater_test_edge',
        name: 'Repeater Test — #5 Edges (25mm)',
        exercise: { id: 'repeaters', name: 'Repeaters' },
        holdId: 5,
        holdName: '#5 Edges (25mm)',
        description: '7s on / 3s off on the medium edge until failure.',
        metric: 'reps',
        unit: 'reps',
        hangTime: 7,
        restTime: 3,
      },
      // One-handed tests — 2-finger pocket, R then L
      {
        id: 'max_hang_pocket_2f_r',
        name: 'Max Hang — #12 2-Finger Pockets 30mm (Right)',
        exercise: { id: 'dead_hang', name: 'Dead Hang' },
        holdId: 12,
        holdName: '#12 2-Finger Pockets (30mm)',
        hand: 'right',
        oneHanded: true,
        description: 'Hang as long as you can with your RIGHT hand on the 2-finger pocket.',
        metric: 'time',
        unit: 'seconds',
      },
      {
        id: 'max_hang_pocket_2f_l',
        name: 'Max Hang — #12 2-Finger Pockets 30mm (Left)',
        exercise: { id: 'dead_hang', name: 'Dead Hang' },
        holdId: 12,
        holdName: '#12 2-Finger Pockets (30mm)',
        hand: 'left',
        oneHanded: true,
        description: 'Hang as long as you can with your LEFT hand on the 2-finger pocket.',
        metric: 'time',
        unit: 'seconds',
      },
    ],
  };
}

export function analyzeAssessment(results) {
  const jugHang = results.max_hang_jug || 0;
  const edgeHang = results.max_hang_edge || 0;
  const pocketHang = results.max_hang_pocket || 0;
  const jugRepeaters = results.repeater_test || 0;
  const edgeRepeaters = results.repeater_test_edge || 0;
  const pocket2fR = results.max_hang_pocket_2f_r || 0;
  const pocket2fL = results.max_hang_pocket_2f_l || 0;

  let suggestedLevel = 1;
  if (edgeHang >= 20 && jugRepeaters >= 8) {
    suggestedLevel = 3;
  } else if (edgeHang >= 10 && jugRepeaters >= 5) {
    suggestedLevel = 2;
  }

  return {
    maxHangTime: Math.max(jugHang, edgeHang, pocketHang),
    avgHangTime: (jugHang + edgeHang + pocketHang) / 3,
    maxRepeaterReps: Math.max(jugRepeaters, edgeRepeaters),
    strengthProfile: {
      jugs: jugHang,
      edges: edgeHang,
      pockets: pocketHang,
      'pocket R': pocket2fR,
      'pocket L': pocket2fL,
    },
    staminaProfile: {
      jugs: jugRepeaters,
      edges: edgeRepeaters,
    },
    handBalance: {
      right: pocket2fR,
      left: pocket2fL,
      imbalance: pocket2fR > 0 && pocket2fL > 0
        ? Math.round(Math.abs(pocket2fR - pocket2fL) / Math.max(pocket2fR, pocket2fL) * 100)
        : 0,
      weakerHand: pocket2fR < pocket2fL ? 'right' : pocket2fL < pocket2fR ? 'left' : 'equal',
    },
    suggestedLevel,
    weaknesses: identifyWeaknesses(jugHang, edgeHang, pocketHang, jugRepeaters, edgeRepeaters, pocket2fR, pocket2fL),
  };
}

function identifyWeaknesses(jugHang, edgeHang, pocketHang, jugRep, edgeRep, pocket2fR, pocket2fL) {
  const weaknesses = [];
  const avg = (jugHang + edgeHang + pocketHang) / 3;

  if (edgeHang < avg * 0.7) weaknesses.push('Edge strength needs work');
  if (pocketHang < avg * 0.7) weaknesses.push('Pocket strength needs work');
  if (jugRep < 5) weaknesses.push('General stamina needs improvement');
  if (edgeRep < jugRep * 0.5) weaknesses.push('Edge endurance is lagging');

  // Hand imbalance detection
  if (pocket2fR > 0 && pocket2fL > 0) {
    const imbalance = Math.abs(pocket2fR - pocket2fL) / Math.max(pocket2fR, pocket2fL);
    if (imbalance > 0.2) {
      const weaker = pocket2fR < pocket2fL ? 'Right' : 'Left';
      weaknesses.push(`${weaker} hand is ${Math.round(imbalance * 100)}% weaker — focus on balancing`);
    }
  }

  return weaknesses;
}
