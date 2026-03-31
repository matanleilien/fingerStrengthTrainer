// Metolius Simulator 3D Training Guide — official content
// Source: https://www.metoliusclimbing.com/pages/training-guides

// === FUNDAMENTALS ===
// - Use open-handed grip as often as possible (reduces injury, transfers to crimp strength)
// - Warm up 15 min minimum: easy climbing, pull-ups, dead hangs, stretching
// - Gradually increase intensity; reverse process to cool down (15-20 min easy)
// - Full recovery between sessions; extended warm-up or no progress = insufficient rest
// - Reduce difficulty: foot on chair or partner assistance

// === CYCLIC PERIODIZATION ===
export const PERIODIZATION_GUIDE = {
  conditioning: {
    intensity: '60-70%',
    volume: 'moderate',
    hangTimes: 'long',
    reps: 'many',
    gymDays: '1-2/week',
    pushToFailure: false,
    notes: 'Warm-up and active rest cycle. Prepares body for intense training.',
  },
  load: {
    intensity: '70-80%',
    volume: 'moderate to high',
    hangTimes: 'long',
    reps: 'many',
    gymDays: '3-5/week',
    pushToFailure: 'occasionally',
    microCycle: 'hard/easy/moderate',
    notes: 'Builds endurance, connective tissue, muscle strength. Last part of cycle you\'ll be weaker due to high volume.',
  },
  recovery: {
    intensity: '50-60%',
    volume: 'low',
    hangTimes: 'short',
    reps: 'few',
    gymDays: '1-2/week',
    pushToFailure: false,
    notes: 'Prepares body for upcoming peak intensity.',
  },
  peak: {
    intensity: '80-100%',
    volume: 'low',
    hangTimes: 'short (high resistance)',
    reps: 'few',
    gymDays: '2-3/week',
    pushToFailure: true,
    microCycle: 'hard/easy/moderate',
    notes: 'Maximum strength and power. May need added weight. Cannot substitute climbing for gym.',
  },
  off: {
    intensity: '0%',
    gymDays: '0',
    notes: 'Complete rest from gym. Body is peaked for hard climbing.',
  },
};

// === EXERCISES ===
export const EXERCISE_GUIDE = {
  dead_hang: {
    name: 'Dead Hang',
    description: 'Fundamental exercise for contact strength. Never lock elbows completely — keep slight bend.',
    prerequisite: 'Master on any hold before attempting other exercises on that hold.',
  },
  bent_arm_hang: {
    name: 'Bent Arm Hang',
    description: 'Pull to designated angle and hold static contraction. Vary angles.',
    caution: 'Careful with maximal contractions at full lock-off — can cause injury.',
  },
  offset_hang: {
    name: 'Offset Hang',
    description: 'From bent arm position, shift weight to one side, hold, shift to other side without lowering. Vary angle, duration, reps.',
  },
  pull_up: {
    name: 'Pull-Up',
    description: 'Smooth execution. No jerking, kipping, swinging. Keep lower body quiet. Don\'t lock elbows at bottom.',
    focus: 'Perfect form over rep count.',
  },
  offset_pull_up: {
    name: 'Offset Pull-Up',
    description: 'First step to one-arm pull-ups. Center weight under one arm, use lower hold with other hand for minimal assistance.',
  },
  one_arm_pull_up: {
    name: 'One-Arm Pull-Up',
    description: 'Pronate arm more. Practice negatives if can\'t do full reps.',
    caution: 'Very high injury potential. Must be smooth. Don\'t bounce!',
  },
  l_hang: {
    name: 'L-Hang',
    description: 'Core strength emphasis. Pull legs to 90° with straight knees and pointed toes. Hold static or do slow reps. Keep abs contracted entire time.',
    modification: 'Bend knees at 90° if straight legs too difficult.',
  },
  front_lever: {
    name: 'Front Lever',
    description: 'Progress: both knees bent → one leg straight/one bent → full front lever → one arm.',
  },
  repeaters: {
    name: 'Repeaters',
    description: 'Hang for set time, rest briefly, repeat until failure. Tests endurance.',
  },
};

// === SIMULATOR 3D — 10-MINUTE SEQUENCES ===
// Each sequence has 10 minutes. Perform the task, rest remainder of minute.
export const TEN_MINUTE_SEQUENCES = {
  entry: {
    label: 'Entry Level',
    totals: '7 pull-ups, 1:26 hang time',
    minutes: [
      { min: 1, exerciseId: 'dead_hang',     holdIds: [7],     duration: 10,              description: '10s dead hang — Flat Edge (#7)' },
      { min: 2, exerciseId: 'dead_hang',     holdIds: [1],     duration: 15, pullUps: 1,  description: '15s dead hang + 1 pull-up — Outer Jug (#1)' },
      { min: 3, exerciseId: 'offset_pull_up',holdIds: [14, 4], pullUps: 2,               description: '2 offset pull-ups — Center Jug (#14) high, 3-Finger Pocket (#4) low' },
      { min: 4, exerciseId: 'dead_hang',     holdIds: [9],     duration: 15,              description: '15s dead hang — Deep 3-Finger Pocket (#9)' },
      { min: 5, exerciseId: 'dead_hang',     holdIds: [2],     duration: 12, notes: 'Follow with 5 knee raises on Outer Jug (#1)', description: '12s dead hang — Flat Sloper (#2), then 5 knee raises on Outer Jug' },
      { min: 6, exerciseId: 'offset_hang',   holdIds: [15, 5], duration: 16,              description: '16s offset hang (8s/side) — Center Pocket (#15) high, Medium Edge (#5) low' },
      { min: 7, exerciseId: 'pull_up',       holdIds: [1],     pullUps: 3,               description: '3 pull-ups — Outer Jug (#1)' },
      { min: 8, exerciseId: 'bent_arm_hang', holdIds: [3],     duration: 8,               description: '8s bent arm hang at 90° — Round Sloper (#3)' },
      { min: 9, exerciseId: 'pull_up',       holdIds: [9],     pullUps: 1,  duration: 10, description: '1 pull-up then 10s dead hang — Deep 3-Finger Pocket (#9)' },
      { min: 10, exerciseId: 'dead_hang',    holdIds: [1],     duration: 30, toFailure: true, description: 'Dead hang to failure — any holds (start on Outer Jug)' },
    ],
  },
  intermediate: {
    label: 'Intermediate',
    totals: '12 pull-ups, 20 knee raises, 3:30 hang time',
    minutes: [
      { min: 1, exerciseId: 'dead_hang',      holdIds: [5],    duration: 25,              description: '25s dead hang — Medium Edge (#5)' },
      { min: 2, exerciseId: 'dead_hang',      holdIds: [2],    duration: 20, pullUps: 3,  description: '20s dead hang + 3 pull-ups — Flat Sloper (#2)' },
      { min: 3, exerciseId: 'bent_arm_hang',  holdIds: [6],    duration: 15, notes: 'Follow with 10 knee raises on Outer Jug (#1)', description: '15s bent arm hang — Shallow Edge (#6), then 10 knee raises on Jug' },
      { min: 4, exerciseId: 'dead_hang',      holdIds: [2, 3], duration: 30,              description: '15s Flat Sloper (#2) + 15s Round Sloper (#3)' },
      { min: 5, exerciseId: 'offset_hang',    holdIds: [1, 17],duration: 20,              description: '20s offset hang (reverse) — Outer Jug (#1) & Small Center Pocket (#17)' },
      { min: 6, exerciseId: 'offset_hang',    holdIds: [4, 9], duration: 15,              description: '15s offset hang (reverse) — 3-Finger Pocket (#4) & Deep 3-Finger Pocket (#9)' },
      { min: 7, exerciseId: 'pull_up',        holdIds: [5],    pullUps: 4,  notes: 'Follow with 10 knee raises on any hold', description: '4 pull-ups — Medium Edge (#5), then 10 knee raises' },
      { min: 8, exerciseId: 'dead_hang',      holdIds: [7],    duration: 30,              description: '30s dead hang — Flat Edge (#7)' },
      { min: 9, exerciseId: 'dead_hang',      holdIds: [1],    duration: 20, oneArm: true, description: '10s per arm — Outer Jug (#1), right then left' },
      { min: 10, exerciseId: 'pull_up',       holdIds: [7, 3], pullUps: 5,  toFailure: true, description: '5 pull-ups Flat Edge (#7), then dead hang Round Sloper (#3) to failure' },
    ],
  },
  advanced: {
    label: 'Advanced',
    totals: '33 pull-ups, 3:38 hang time',
    minutes: [
      { min: 1, exerciseId: 'dead_hang',      holdIds: [6, 9], duration: 25, pullUps: 5,  description: '25s dead hang Shallow Edge (#6), then 5 pull-ups Deep 3-Finger Pocket (#9)' },
      { min: 2, exerciseId: 'offset_pull_up', holdIds: [15, 12],pullUps: 5,               description: '5 offset pull-ups — Center Pocket (#15) high, 2-Finger Pocket (#12) low, reverse' },
      { min: 3, exerciseId: 'dead_hang',      holdIds: [11],   duration: 45,              description: '45s dead hang — Shallow Edge (#11)' },
      { min: 4, exerciseId: 'offset_pull_up', holdIds: [3, 4], pullUps: 5,               description: '5 offset pull-ups — Round Sloper (#3) high, 3-Finger Pocket (#4) low, reverse' },
      { min: 5, exerciseId: 'dead_hang',      holdIds: [11, 9, 6, 2], duration: 25,      description: '10s Shallow Edge (#11), campus to #9, #6, #2, hold 15s' },
      { min: 6, exerciseId: 'dead_hang',      holdIds: [3],    duration: 30, oneArm: true, description: '15s per arm — Round Sloper (#3), 10s rest between sides' },
      { min: 7, exerciseId: 'l_hang',         holdIds: [1, 12],pullUps: 5,  duration: 20, description: '5 L-sit pull-ups Jug (#1), 20s bent arm hang 2-Finger Pocket (#12)' },
      { min: 8, exerciseId: 'bent_arm_hang',  holdIds: [8],    duration: 45,              description: '20s bent arm Shallow 3-Finger Pocket (#8), bump and 25s dead hang' },
      { min: 9, exerciseId: 'dead_hang',      holdIds: [18, 17],duration: 20, pullUps: 3, description: '10s per arm center pockets (#18 & #17), 3 power pull-ups' },
      { min: 10, exerciseId: 'pull_up',       holdIds: [1, 3], pullUps: 8,  toFailure: true, description: '8 fast pull-ups Jug (#1), dead hang Round Sloper (#3) to failure' },
    ],
  },
};
