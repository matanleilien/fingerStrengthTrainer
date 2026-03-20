// Metolius Simulator 3D hold mapping
// Each hold has an id matching the board numbering (1-18)
// The board is symmetric — left and right sides mirror each other
// Positions are percentages relative to the fingerboard image dimensions

export const HOLD_TYPES = {
  JUG: 'jug',
  LARGE_EDGE: 'large_edge',
  MEDIUM_EDGE: 'medium_edge',
  SMALL_EDGE: 'small_edge',
  SLOPER: 'sloper',
  LARGE_POCKET_3F: 'large_pocket_3f',
  SMALL_POCKET_3F: 'small_pocket_3f',
  LARGE_POCKET_2F: 'large_pocket_2f',
  SMALL_POCKET_2F: 'small_pocket_2f',
  LARGE_POCKET_1F: 'large_pocket_1f',
  SMALL_POCKET_1F: 'small_pocket_1f',
};

export const DIFFICULTY_ORDER = [
  HOLD_TYPES.JUG,
  HOLD_TYPES.SLOPER,
  HOLD_TYPES.LARGE_EDGE,
  HOLD_TYPES.LARGE_POCKET_3F,
  HOLD_TYPES.MEDIUM_EDGE,
  HOLD_TYPES.SMALL_POCKET_3F,
  HOLD_TYPES.LARGE_POCKET_2F,
  HOLD_TYPES.SMALL_EDGE,
  HOLD_TYPES.SMALL_POCKET_2F,
  HOLD_TYPES.LARGE_POCKET_1F,
  HOLD_TYPES.SMALL_POCKET_1F,
];

// Hold definitions with positions for overlay highlighting
// x, y are center percentages; w, h are size percentages of the image
// oneHanded: true means each side is a single-hand hold — train L and R separately
// positions[0] = left side, positions[1] = right side (when paired)
export const HOLDS = [
  {
    id: 1,
    name: 'Jug Rail',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    difficulty: 1,
    oneHanded: false,
    description: 'Large jug rail — easiest hold on the board',
    positions: [
      { x: 4, y: 20, w: 8, h: 14 },    // left
      { x: 96, y: 20, w: 8, h: 14 },   // right
    ],
  },
  {
    id: 2,
    name: 'Large Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    oneHanded: false,
    description: 'Wide, incut edge — good for 4-finger open hand',
    positions: [
      { x: 16, y: 16, w: 9, h: 12 },
      { x: 84, y: 16, w: 9, h: 12 },
    ],
  },
  {
    id: 3,
    name: 'Sloper',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    difficulty: 4,
    oneHanded: false,
    description: 'Rounded sloper — requires open-hand technique',
    positions: [
      { x: 27, y: 13, w: 9, h: 13 },
      { x: 73, y: 13, w: 9, h: 13 },
    ],
  },
  {
    id: 4,
    name: 'Large 4-Finger Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    oneHanded: false,
    description: 'Large 4-finger incut edge',
    positions: [
      { x: 7, y: 37, w: 8, h: 12 },
      { x: 93, y: 37, w: 8, h: 12 },
    ],
  },
  {
    id: 5,
    name: 'Medium 4-Finger Edge',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    oneHanded: false,
    description: 'Medium 4-finger edge',
    positions: [
      { x: 16, y: 37, w: 8, h: 12 },
      { x: 84, y: 37, w: 8, h: 12 },
    ],
  },
  {
    id: 6,
    name: 'Small 4-Finger Edge',
    type: HOLD_TYPES.SMALL_EDGE,
    fingers: 4,
    difficulty: 7,
    oneHanded: false,
    description: 'Small 4-finger edge — advanced',
    positions: [
      { x: 25, y: 37, w: 7.5, h: 12 },
      { x: 75, y: 37, w: 7.5, h: 12 },
    ],
  },
  {
    id: 7,
    name: 'Large 3-Finger Pocket',
    type: HOLD_TYPES.LARGE_POCKET_3F,
    fingers: 3,
    difficulty: 4,
    oneHanded: false,
    description: 'Large 3-finger pocket',
    positions: [
      { x: 34, y: 37, w: 7, h: 12 },
      { x: 66, y: 37, w: 7, h: 12 },
    ],
  },
  {
    id: 8,
    name: 'Medium 3-Finger Pocket',
    type: HOLD_TYPES.SMALL_POCKET_3F,
    fingers: 3,
    difficulty: 6,
    oneHanded: true,
    description: 'Medium 3-finger pocket — one hand at a time',
    positions: [
      { x: 7, y: 56, w: 8, h: 12 },
      { x: 93, y: 56, w: 8, h: 12 },
    ],
  },
  {
    id: 9,
    name: 'Large 2-Finger Pocket',
    type: HOLD_TYPES.LARGE_POCKET_2F,
    fingers: 2,
    difficulty: 6,
    oneHanded: true,
    description: 'Large 2-finger pocket — one hand at a time',
    positions: [
      { x: 16, y: 56, w: 7.5, h: 12 },
      { x: 84, y: 56, w: 7.5, h: 12 },
    ],
  },
  {
    id: 10,
    name: 'Small 2-Finger Pocket',
    type: HOLD_TYPES.SMALL_POCKET_2F,
    fingers: 2,
    difficulty: 8,
    oneHanded: true,
    description: 'Small 2-finger pocket — one hand, advanced',
    positions: [
      { x: 25, y: 56, w: 7, h: 12 },
      { x: 75, y: 56, w: 7, h: 12 },
    ],
  },
  {
    id: 11,
    name: 'Large 1-Finger Pocket (Mono)',
    type: HOLD_TYPES.LARGE_POCKET_1F,
    fingers: 1,
    difficulty: 9,
    oneHanded: true,
    description: 'Large mono pocket — one hand, expert only',
    positions: [
      { x: 7, y: 74, w: 8, h: 12 },
      { x: 93, y: 74, w: 8, h: 12 },
    ],
  },
  {
    id: 12,
    name: 'Small 1-Finger Pocket (Mono)',
    type: HOLD_TYPES.SMALL_POCKET_1F,
    fingers: 1,
    difficulty: 10,
    oneHanded: true,
    description: 'Small mono pocket — one hand, expert only, high injury risk',
    positions: [
      { x: 16, y: 74, w: 7.5, h: 12 },
      { x: 84, y: 74, w: 7.5, h: 12 },
    ],
  },
  {
    id: 13,
    name: 'Medium Edge (Outer)',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    oneHanded: true,
    description: 'Medium edge — outer bottom, one hand at a time',
    positions: [
      { x: 25, y: 74, w: 7, h: 12 },
      { x: 75, y: 74, w: 7, h: 12 },
    ],
  },
  {
    id: 14,
    name: 'Top Jug',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    difficulty: 1,
    oneHanded: false,
    description: 'Large jug at top center — easiest hold',
    positions: [
      { x: 50, y: 6, w: 12, h: 12 },
    ],
  },
  {
    id: 15,
    name: 'Center Sloper',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    difficulty: 4,
    oneHanded: false,
    description: 'Sloper — center of board',
    positions: [
      { x: 50, y: 16, w: 9, h: 12 },
    ],
  },
  {
    id: 16,
    name: 'Center Medium Edge',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    oneHanded: false,
    description: 'Medium edge — center of board',
    positions: [
      { x: 50, y: 37, w: 8, h: 12 },
    ],
  },
  {
    id: 17,
    name: 'Center Large Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    oneHanded: false,
    description: 'Large edge — center of board',
    positions: [
      { x: 50, y: 56, w: 8, h: 12 },
    ],
  },
  {
    id: 18,
    name: 'Center Small Edge',
    type: HOLD_TYPES.SMALL_EDGE,
    fingers: 4,
    difficulty: 7,
    oneHanded: false,
    description: 'Small edge — center bottom',
    positions: [
      { x: 50, y: 74, w: 8, h: 12 },
    ],
  },
];

export function getHoldById(id) {
  return HOLDS.find(h => h.id === id);
}

export function getHoldsByType(type) {
  return HOLDS.filter(h => h.type === type);
}

export function getHoldsByDifficultyRange(minDiff, maxDiff) {
  return HOLDS.filter(h => h.difficulty >= minDiff && h.difficulty <= maxDiff);
}
