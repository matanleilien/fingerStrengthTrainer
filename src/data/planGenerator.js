// Generates workout plans based on assessment results, current cycle, and user level
import { HOLDS, getHoldsByDifficultyRange, getHoldById } from './holds';
import { EXERCISES, getExercisesForLevel } from './exercises';
import { CYCLE_CONFIG, getCycleIntensity } from './periodization';
import { applyAdjustmentToExercise } from '../utils/failureAdjustment';
import { getBandConfig, defaultBandAssistance } from '../utils/bandAssistance';
import { getBandAssistance } from '../utils/storage';

const LEVELS = {
  1: { name: 'Beginner', maxHoldDifficulty: 4, baseHangTime: 10, baseReps: 3 },
  2: { name: 'Intermediate', maxHoldDifficulty: 7, baseHangTime: 15, baseReps: 5 },
  3: { name: 'Advanced', maxHoldDifficulty: 10, baseHangTime: 20, baseReps: 7 },
};

export { LEVELS };

export function generateWorkout(userProfile, cycleInfo, assessmentResults, failureAdjustments = null) {
  const { level, daysPerWeek } = userProfile;
  const { cycle, config, microCycleDay } = cycleInfo;
  const levelConfig = LEVELS[level] || LEVELS[1];

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
  const availableHolds = getHoldsByDifficultyRange(1, levelConfig.maxHoldDifficulty);

  // Calculate hang time and reps based on assessment, cycle, and intensity
  const maxHangTime = assessmentResults?.maxHangTime || levelConfig.baseHangTime;
  const hangTime = Math.round(maxHangTime * intensity * config.hangTimeMultiplier);
  const restTime = Math.max(hangTime, 10); // rest at least as long as hang

  const baseReps = assessmentResults?.maxRepeaterReps || levelConfig.baseReps;
  const reps = Math.max(1, Math.round(baseReps * intensity * config.repsMultiplier));

  // Select holds appropriate for the workout
  const workoutHolds = selectHoldsForWorkout(availableHolds, intensity, level);

  // Build exercise sequence based on cycle type
  const exercises = buildExerciseSequence(
    cycle, microCycleDay, availableExercises, workoutHolds,
    hangTime, restTime, reps, intensity, level
  );

  // Expand one-handed holds into separate L/R exercises
  const expandedExercises = expandOneHandedExercises(exercises);

  // Apply failure adjustments to reduce difficulty where user has struggled
  const adjustedExercises = failureAdjustments
    ? expandedExercises.map(ex => applyAdjustmentToExercise(ex, failureAdjustments))
    : expandedExercises;

  return {
    type: cycle,
    microCycleDay,
    intensity: Math.round(intensity * 100),
    warmUpMinutes: 15,
    coolDownMinutes: 15,
    exercises: adjustedExercises,
    totalSets: adjustedExercises.reduce((sum, e) => sum + (e.sets || 1), 0),
    estimatedMinutes: estimateWorkoutDuration(adjustedExercises),
  };
}

// For one-handed holds, duplicate the exercise: once for right hand, once for left
// Also annotates with the user's current band assistance level
function expandOneHandedExercises(exercises) {
  const bandAssistance = getBandAssistance() || defaultBandAssistance();
  const expanded = [];
  for (const ex of exercises) {
    const hold = getHoldById(ex.holdId);
    if (hold?.oneHanded) {
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
            : `${hand.toUpperCase()} hand — unassisted`,
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

function selectHoldsForWorkout(holds, intensity, level) {
  // Sort by difficulty, pick holds matching intensity
  const sorted = [...holds].sort((a, b) => a.difficulty - b.difficulty);
  const targetDifficulty = Math.ceil(sorted.length * intensity);

  // Always include an easy two-handed hold for warm-up (never one-handed center holds)
  const easyHold = sorted.find(h => !h.oneHanded) || sorted[0];
  const workHolds = sorted.slice(
    Math.max(0, targetDifficulty - 3),
    Math.min(sorted.length, targetDifficulty + 1)
  );

  // Deduplicate and ensure variety
  const selected = [easyHold, ...workHolds];
  const unique = [...new Map(selected.map(h => [h.id, h])).values()];
  return unique.slice(0, 5);
}

function buildExerciseSequence(cycle, microDay, exercises, holds, hangTime, restTime, reps, intensity, level) {
  const sequence = [];
  // Never use one-handed (center) holds for warm-up
  const warmUpHold = holds.find(h => !h.oneHanded) || holds[0];

  // Warm-up: always start with easy dead hangs
  sequence.push({
    exercise: exercises.find(e => e.id === 'dead_hang'),
    holdId: warmUpHold.id,
    holdName: warmUpHold.name,
    hangTime: Math.round(hangTime * 0.5),
    restTime: 15,
    sets: 2,
    reps: 1,
    isWarmUp: true,
    notes: 'Warm-up: easy dead hangs on jugs',
  });

  if (cycle === 'conditioning') {
    // Long hangs, many reps, moderate holds
    holds.slice(0, 3).forEach(hold => {
      sequence.push({
        exercise: exercises.find(e => e.id === 'dead_hang'),
        holdId: hold.id,
        holdName: hold.name,
        hangTime,
        restTime,
        sets: 3,
        reps: 1,
        notes: `Dead hang at ${Math.round(intensity * 100)}% effort`,
      });
    });

    if (level >= 2) {
      sequence.push({
        exercise: exercises.find(e => e.id === 'bent_arm_hang'),
        holdId: holds[0].id,
        holdName: holds[0].name,
        hangTime: Math.round(hangTime * 0.8),
        restTime,
        sets: 2,
        reps: 1,
        notes: 'Bent arm hang at 90°',
      });
    }

    // Repeaters for endurance
    sequence.push({
      exercise: exercises.find(e => e.id === 'repeaters'),
      holdId: holds[1]?.id || holds[0].id,
      holdName: holds[1]?.name || holds[0].name,
      hangTime: 7,
      restTime: 3,
      sets: 2,
      reps: Math.max(3, reps),
      notes: '7s on / 3s off repeaters',
    });

  } else if (cycle === 'load') {
    // High volume, varied exercises
    const mainHolds = holds.slice(1);
    mainHolds.forEach((hold, i) => {
      sequence.push({
        exercise: exercises.find(e => e.id === 'dead_hang'),
        holdId: hold.id,
        holdName: hold.name,
        hangTime,
        restTime,
        sets: microDay === 'hard' ? 4 : microDay === 'moderate' ? 3 : 2,
        reps: 1,
        notes: `${microDay} day dead hang`,
      });
    });

    // Repeaters
    sequence.push({
      exercise: exercises.find(e => e.id === 'repeaters'),
      holdId: mainHolds[0]?.id || holds[0].id,
      holdName: mainHolds[0]?.name || holds[0].name,
      hangTime: 7,
      restTime: 3,
      sets: microDay === 'hard' ? 4 : 3,
      reps: Math.max(4, reps),
      notes: '7s on / 3s off repeaters — endurance focus',
    });

    if (level >= 2) {
      sequence.push({
        exercise: exercises.find(e => e.id === 'pull_up'),
        holdId: holds[0].id,
        holdName: holds[0].name,
        hangTime: 0,
        restTime: 60,
        sets: 3,
        reps: Math.max(3, Math.round(reps * 0.8)),
        notes: 'Controlled pull-ups — perfect form',
      });
    }

    // Core work
    if (level >= 2) {
      sequence.push({
        exercise: exercises.find(e => e.id === 'l_hang'),
        holdId: holds[0].id,
        holdName: holds[0].name,
        hangTime: Math.round(hangTime * 0.7),
        restTime: 30,
        sets: 2,
        reps: 1,
        notes: 'L-hang for core strength',
      });
    }

  } else if (cycle === 'recovery') {
    // Low volume, easy holds
    sequence.push({
      exercise: exercises.find(e => e.id === 'dead_hang'),
      holdId: holds[0].id,
      holdName: holds[0].name,
      hangTime: Math.round(hangTime * 0.6),
      restTime: restTime * 1.5,
      sets: 2,
      reps: 1,
      notes: 'Light dead hangs — recovery focus',
    });

    sequence.push({
      exercise: exercises.find(e => e.id === 'repeaters'),
      holdId: holds[0].id,
      holdName: holds[0].name,
      hangTime: 5,
      restTime: 5,
      sets: 2,
      reps: 3,
      notes: 'Light repeaters — keep blood flowing',
    });

  } else if (cycle === 'peak') {
    // High intensity, low volume, harder holds
    const hardHolds = holds.slice(-3);
    hardHolds.forEach(hold => {
      sequence.push({
        exercise: exercises.find(e => e.id === 'dead_hang'),
        holdId: hold.id,
        holdName: hold.name,
        hangTime: Math.round(hangTime * 0.7),
        restTime: restTime * 2,
        sets: microDay === 'hard' ? 3 : 2,
        reps: 1,
        notes: `Peak intensity dead hang — ${microDay} day. Add weight if hang > 12s.`,
      });
    });

    if (level >= 2) {
      sequence.push({
        exercise: exercises.find(e => e.id === 'pull_up'),
        holdId: hardHolds[0]?.id || holds[0].id,
        holdName: hardHolds[0]?.name || holds[0].name,
        hangTime: 0,
        restTime: 90,
        sets: 3,
        reps: Math.max(2, Math.round(reps * 0.5)),
        notes: 'Max effort pull-ups on smaller holds',
      });
    }

    if (level >= 3) {
      sequence.push({
        exercise: exercises.find(e => e.id === 'offset_pull_up'),
        holdId: holds[0].id,
        holdName: holds[0].name,
        hangTime: 0,
        restTime: 120,
        sets: 2,
        reps: 3,
        notes: 'Offset pull-ups — one arm emphasis',
      });
    }
  }

  return sequence;
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
