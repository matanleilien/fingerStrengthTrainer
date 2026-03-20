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
export const HOLDS = [
  {
    id: 1,
    name: 'Jug Rail',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    difficulty: 1,
    description: 'Large jug rail — easiest hold on the board',
    positions: [
      { x: 5.5, y: 18, w: 7, h: 10 },   // left
      { x: 94.5, y: 18, w: 7, h: 10 },   // right
    ],
  },
  {
    id: 2,
    name: 'Large Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    description: 'Wide, incut edge — good for 4-finger open hand',
    positions: [
      { x: 17, y: 14, w: 8, h: 8 },
      { x: 83, y: 14, w: 8, h: 8 },
    ],
  },
  {
    id: 3,
    name: 'Sloper',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    difficulty: 4,
    description: 'Rounded sloper — requires open-hand technique',
    positions: [
      { x: 28, y: 10, w: 8, h: 9 },
      { x: 72, y: 10, w: 8, h: 9 },
    ],
  },
  {
    id: 4,
    name: 'Large 4-Finger Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    description: 'Large 4-finger incut edge',
    positions: [
      { x: 8, y: 34, w: 7.5, h: 8 },
      { x: 92, y: 34, w: 7.5, h: 8 },
    ],
  },
  {
    id: 5,
    name: 'Medium 4-Finger Edge',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    description: 'Medium 4-finger edge',
    positions: [
      { x: 16.5, y: 34, w: 7.5, h: 8 },
      { x: 83.5, y: 34, w: 7.5, h: 8 },
    ],
  },
  {
    id: 6,
    name: 'Small 4-Finger Edge',
    type: HOLD_TYPES.SMALL_EDGE,
    fingers: 4,
    difficulty: 7,
    description: 'Small 4-finger edge — advanced',
    positions: [
      { x: 25.5, y: 34, w: 7, h: 8 },
      { x: 74.5, y: 34, w: 7, h: 8 },
    ],
  },
  {
    id: 7,
    name: 'Large 3-Finger Pocket',
    type: HOLD_TYPES.LARGE_POCKET_3F,
    fingers: 3,
    difficulty: 4,
    description: 'Large 3-finger pocket',
    positions: [
      { x: 33.5, y: 34, w: 6.5, h: 8 },
      { x: 66.5, y: 34, w: 6.5, h: 8 },
    ],
  },
  {
    id: 8,
    name: 'Medium 3-Finger Pocket',
    type: HOLD_TYPES.SMALL_POCKET_3F,
    fingers: 3,
    difficulty: 6,
    description: 'Medium 3-finger pocket',
    positions: [
      { x: 8, y: 52, w: 7.5, h: 8 },
      { x: 92, y: 52, w: 7.5, h: 8 },
    ],
  },
  {
    id: 9,
    name: 'Large 2-Finger Pocket',
    type: HOLD_TYPES.LARGE_POCKET_2F,
    fingers: 2,
    difficulty: 6,
    description: 'Large 2-finger pocket',
    positions: [
      { x: 17, y: 52, w: 7, h: 8 },
      { x: 83, y: 52, w: 7, h: 8 },
    ],
  },
  {
    id: 10,
    name: 'Small 2-Finger Pocket',
    type: HOLD_TYPES.SMALL_POCKET_2F,
    fingers: 2,
    difficulty: 8,
    description: 'Small 2-finger pocket — advanced',
    positions: [
      { x: 25.5, y: 52, w: 6.5, h: 8 },
      { x: 74.5, y: 52, w: 6.5, h: 8 },
    ],
  },
  {
    id: 11,
    name: 'Large 1-Finger Pocket (Mono)',
    type: HOLD_TYPES.LARGE_POCKET_1F,
    fingers: 1,
    difficulty: 9,
    description: 'Large mono pocket — expert only',
    positions: [
      { x: 8, y: 70, w: 7, h: 8 },
      { x: 92, y: 70, w: 7, h: 8 },
    ],
  },
  {
    id: 12,
    name: 'Small 1-Finger Pocket (Mono)',
    type: HOLD_TYPES.SMALL_POCKET_1F,
    fingers: 1,
    difficulty: 10,
    description: 'Small mono pocket — expert only, high injury risk',
    positions: [
      { x: 17, y: 70, w: 6.5, h: 8 },
      { x: 83, y: 70, w: 6.5, h: 8 },
    ],
  },
  {
    id: 13,
    name: 'Medium Edge (Center)',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    description: 'Medium edge — center bottom',
    positions: [
      { x: 25.5, y: 70, w: 6.5, h: 8 },
      { x: 74.5, y: 70, w: 6.5, h: 8 },
    ],
  },
  {
    id: 14,
    name: 'Top Jug',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    difficulty: 1,
    description: 'Large jug at top center — easiest hold',
    positions: [
      { x: 50, y: 4, w: 10, h: 10 },
    ],
  },
  {
    id: 15,
    name: 'Center Sloper',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    difficulty: 4,
    description: 'Sloper — center of board',
    positions: [
      { x: 50, y: 14, w: 8, h: 8 },
    ],
  },
  {
    id: 16,
    name: 'Center Medium Edge',
    type: HOLD_TYPES.MEDIUM_EDGE,
    fingers: 4,
    difficulty: 5,
    description: 'Medium edge — center of board',
    positions: [
      { x: 50, y: 34, w: 7, h: 8 },
    ],
  },
  {
    id: 17,
    name: 'Center Large Edge',
    type: HOLD_TYPES.LARGE_EDGE,
    fingers: 4,
    difficulty: 3,
    description: 'Large edge — center of board',
    positions: [
      { x: 50, y: 52, w: 7, h: 8 },
    ],
  },
  {
    id: 18,
    name: 'Center Small Edge',
    type: HOLD_TYPES.SMALL_EDGE,
    fingers: 4,
    difficulty: 7,
    description: 'Small edge — center bottom',
    positions: [
      { x: 50, y: 70, w: 7, h: 8 },
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
