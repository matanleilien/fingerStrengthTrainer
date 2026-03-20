// Exercise definitions based on Metolius training guide + supplementary knowledge

export const EXERCISE_TYPES = {
  DEAD_HANG: 'dead_hang',
  BENT_ARM_HANG: 'bent_arm_hang',
  OFFSET_HANG: 'offset_hang',
  PULL_UP: 'pull_up',
  OFFSET_PULL_UP: 'offset_pull_up',
  ONE_ARM_PULL_UP: 'one_arm_pull_up',
  L_HANG: 'l_hang',
  FRONT_LEVER: 'front_lever',
  REPEATERS: 'repeaters',
};

export const EXERCISES = [
  {
    id: 'dead_hang',
    name: 'Dead Hang',
    type: EXERCISE_TYPES.DEAD_HANG,
    description: 'Fundamental exercise for contact strength. Hang with slightly bent elbows, open-hand grip.',
    instructions: [
      'Grab the designated hold with an open-hand grip',
      'Hang with arms nearly straight — keep a slight bend in your elbows',
      'Never lock your elbows completely',
      'Hold for the designated time',
    ],
    minLevel: 1, // beginner
    muscleGroups: ['fingers', 'forearms', 'shoulders'],
    isAssessment: true,
  },
  {
    id: 'bent_arm_hang',
    name: 'Bent Arm Hang',
    type: EXERCISE_TYPES.BENT_ARM_HANG,
    description: 'Develops lock-off strength. Pull up to a designated angle and hold.',
    instructions: [
      'Grab the designated hold',
      'Pull yourself up to the designated angle (e.g., 90°)',
      'Hold a static contraction for the designated time',
      'Avoid maximal contractions at full lock-off — injury risk',
    ],
    minLevel: 1,
    muscleGroups: ['fingers', 'forearms', 'biceps', 'shoulders'],
    isAssessment: false,
  },
  {
    id: 'offset_hang',
    name: 'Offset Hang',
    type: EXERCISE_TYPES.OFFSET_HANG,
    description: 'Shift weight side to side while maintaining a lock-off position.',
    instructions: [
      'Pull up to a bent arm position',
      'Shift your weight all the way to one side and hold',
      'Shift laterally to the other side without lowering',
      'Hold an equal contraction on each side',
    ],
    minLevel: 2,
    muscleGroups: ['fingers', 'forearms', 'biceps', 'core'],
    isAssessment: false,
  },
  {
    id: 'pull_up',
    name: 'Pull-ups',
    type: EXERCISE_TYPES.PULL_UP,
    description: 'Smooth, controlled pull-ups. Focus on perfect form over reps.',
    instructions: [
      'Grab the designated hold',
      'Pull up smoothly — no jerking, kipping, or swinging',
      'Keep your lower body quiet',
      'Don\'t lock elbows at the bottom',
      'Focus on perfect form, not rep count',
    ],
    minLevel: 1,
    muscleGroups: ['fingers', 'forearms', 'biceps', 'back'],
    isAssessment: false,
  },
  {
    id: 'offset_pull_up',
    name: 'Offset Pull-ups',
    type: EXERCISE_TYPES.OFFSET_PULL_UP,
    description: 'First step to one-arm pull-ups. Weight centered under one arm, other hand assists from a lower hold.',
    instructions: [
      'Center weight under one arm as if doing a one-arm pull-up',
      'Place the other hand on a lower hold for minimal assistance',
      'Pull up smoothly using primarily the top arm',
      'Give yourself just enough assistance to complete the rep',
    ],
    minLevel: 3,
    muscleGroups: ['fingers', 'forearms', 'biceps', 'back'],
    isAssessment: false,
  },
  {
    id: 'one_arm_pull_up',
    name: 'One-arm Pull-ups',
    type: EXERCISE_TYPES.ONE_ARM_PULL_UP,
    description: 'Advanced. Must be perfectly smooth — high injury potential.',
    instructions: [
      'Grab the hold with one hand, pronate your arm slightly',
      'Pull up with perfect control — absolutely no bouncing',
      'If you can\'t complete one, do offset pull-ups with one-arm negatives',
      'Critical: be smooth to avoid injury',
    ],
    minLevel: 3,
    muscleGroups: ['fingers', 'forearms', 'biceps', 'back'],
    isAssessment: false,
  },
  {
    id: 'l_hang',
    name: 'L-Hang',
    type: EXERCISE_TYPES.L_HANG,
    description: 'Core strength emphasis. Hang and hold legs at 90° to torso.',
    instructions: [
      'Hang from a comfortable hold (dead hang or bent arm)',
      'Pull legs up from hips, keeping knees straight and toes pointed',
      'Hold at 90° to your torso',
      'Only lower to 45° below horizontal to keep abs engaged',
      'If too difficult, bend knees at 90°',
    ],
    minLevel: 2,
    muscleGroups: ['core', 'hip_flexors', 'fingers'],
    isAssessment: false,
  },
  {
    id: 'front_lever',
    name: 'Front Lever',
    type: EXERCISE_TYPES.FRONT_LEVER,
    description: 'Advanced core and back exercise. Progress from tucked to full.',
    instructions: [
      'Start with both legs bent at knees (tuck lever)',
      'Progress to one leg straight, one bent',
      'Full front lever: both legs straight, body horizontal',
      'If you can do a good front lever, try it with one arm',
    ],
    minLevel: 3,
    muscleGroups: ['core', 'back', 'shoulders', 'fingers'],
    isAssessment: false,
  },
  {
    id: 'repeaters',
    name: 'Repeaters',
    type: EXERCISE_TYPES.REPEATERS,
    description: 'Timed hang/rest intervals to build endurance. 7s on / 3s off.',
    instructions: [
      'Hang on the designated hold for 7 seconds',
      'Rest (let go) for 3 seconds',
      'Repeat for the designated number of reps',
      'Use open-hand grip',
      'Stop if form breaks down',
    ],
    minLevel: 1,
    muscleGroups: ['fingers', 'forearms'],
    isAssessment: true,
  },
];

export function getExerciseById(id) {
  return EXERCISES.find(e => e.id === id);
}

export function getExercisesForLevel(level) {
  return EXERCISES.filter(e => e.minLevel <= level);
}
