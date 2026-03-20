// Cyclic periodization based on Metolius training guide
// Continuous cycling: Conditioning → Load → Recovery → Peak → Off → repeat

export const CYCLES = {
  CONDITIONING: 'conditioning',
  LOAD: 'load',
  RECOVERY: 'recovery',
  PEAK: 'peak',
  OFF: 'off',
};

export const CYCLE_ORDER = [
  CYCLES.CONDITIONING,
  CYCLES.LOAD,
  CYCLES.RECOVERY,
  CYCLES.PEAK,
  CYCLES.OFF,
];

export const CYCLE_CONFIG = {
  [CYCLES.CONDITIONING]: {
    name: 'Conditioning',
    description: 'Warm-up and active rest. Prepare your body for intense training ahead.',
    intensityRange: [0.6, 0.7], // 60-70% of max
    durationWeeks: 3,
    gymDaysPerWeek: { min: 1, max: 2 },
    hangTimeMultiplier: 1.0, // long hang times
    repsMultiplier: 1.0,     // many reps
    pushToFailure: false,
    color: '#4CAF50',
    icon: '🌱',
  },
  [CYCLES.LOAD]: {
    name: 'Load',
    description: 'Build endurance and connective tissue. Moderate-high volume, micro-cycles of hard/easy/moderate.',
    intensityRange: [0.7, 0.8],
    durationWeeks: 5,
    gymDaysPerWeek: { min: 3, max: 5 },
    hangTimeMultiplier: 1.2,
    repsMultiplier: 1.3,
    pushToFailure: false, // only occasionally
    color: '#FF9800',
    icon: '💪',
  },
  [CYCLES.RECOVERY]: {
    name: 'Recovery',
    description: 'Light training to prepare for peak intensity. Low volume, easy effort.',
    intensityRange: [0.5, 0.6],
    durationWeeks: 2,
    gymDaysPerWeek: { min: 1, max: 2 },
    hangTimeMultiplier: 0.6,
    repsMultiplier: 0.5,
    pushToFailure: false,
    color: '#2196F3',
    icon: '🧘',
  },
  [CYCLES.PEAK]: {
    name: 'Peak',
    description: 'Maximum strength and power. High intensity, low volume, short hangs with added weight if needed.',
    intensityRange: [0.8, 1.0],
    durationWeeks: 4,
    gymDaysPerWeek: { min: 2, max: 3 },
    hangTimeMultiplier: 0.5,
    repsMultiplier: 0.6,
    pushToFailure: true,
    color: '#f44336',
    icon: '🔥',
  },
  [CYCLES.OFF]: {
    name: 'Off',
    description: 'No gym time. Your body is peaked — go climb hard!',
    intensityRange: [0, 0],
    durationWeeks: 2,
    gymDaysPerWeek: { min: 0, max: 0 },
    hangTimeMultiplier: 0,
    repsMultiplier: 0,
    pushToFailure: false,
    color: '#9E9E9E',
    icon: '🏔️',
  },
};

// Micro-cycle pattern within Load and Peak cycles
export const MICRO_CYCLE = ['hard', 'easy', 'moderate'];

export function getCurrentCycleInfo(startDate, today = new Date()) {
  const start = new Date(startDate);
  const diffMs = today - start;
  const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7);

  let weekAccum = 0;
  let cycleIndex = 0;
  let totalCycleWeeks = CYCLE_ORDER.reduce((sum, c) => sum + CYCLE_CONFIG[c].durationWeeks, 0);

  // Which full period are we in?
  const fullPeriods = Math.floor(diffWeeks / totalCycleWeeks);
  let remainingWeeks = diffWeeks - (fullPeriods * totalCycleWeeks);

  for (let i = 0; i < CYCLE_ORDER.length; i++) {
    const cycleWeeks = CYCLE_CONFIG[CYCLE_ORDER[i]].durationWeeks;
    if (remainingWeeks < cycleWeeks) {
      cycleIndex = i;
      weekAccum = remainingWeeks;
      break;
    }
    remainingWeeks -= cycleWeeks;
  }

  const currentCycle = CYCLE_ORDER[cycleIndex];
  const config = CYCLE_CONFIG[currentCycle];
  const weekInCycle = Math.floor(weekAccum);
  const nextCycle = CYCLE_ORDER[(cycleIndex + 1) % CYCLE_ORDER.length];

  // Micro-cycle day (for Load and Peak)
  const dayInCycle = Math.floor((diffMs / (1000 * 60 * 60 * 24)) % 3);
  const microCycleDay = MICRO_CYCLE[dayInCycle];

  return {
    cycle: currentCycle,
    config,
    weekInCycle,
    totalWeeksInCycle: config.durationWeeks,
    nextCycle,
    microCycleDay,
    periodNumber: fullPeriods + 1,
  };
}

export function getCycleIntensity(cycleConfig, microCycleDay) {
  const [min, max] = cycleConfig.intensityRange;
  const mid = (min + max) / 2;

  if (cycleConfig.name === 'Load' || cycleConfig.name === 'Peak') {
    switch (microCycleDay) {
      case 'hard': return max;
      case 'moderate': return mid;
      case 'easy': return min;
      default: return mid;
    }
  }
  return mid;
}
