// Metolius Simulator 3D hold mapping — official numbering & depths
// Source: Simulator 3D Training Guide – Metolius Climbing
// Each hold has an id matching the board numbering (1-18)
// Holds 1-13 appear on both left and right sides (symmetric)
// Holds 14-18 are center holds (single position)
// Positions are percentages relative to the fingerboard image dimensions

export const HOLD_TYPES = {
  JUG: 'jug',
  SLOPER: 'sloper',
  EDGE: 'edge',
  THREE_FINGER_POCKET: 'three_finger_pocket',
  TWO_FINGER_POCKET: 'two_finger_pocket',
};

export const DIFFICULTY_ORDER = [
  HOLD_TYPES.JUG,
  HOLD_TYPES.SLOPER,
  HOLD_TYPES.EDGE,
  HOLD_TYPES.THREE_FINGER_POCKET,
  HOLD_TYPES.TWO_FINGER_POCKET,
];

// Hold definitions with positions for overlay highlighting
// x, y are center percentages; w, h are size percentages of the image
// depthMm: hold depth in millimeters (from official Metolius spec)
// oneHanded: true means train L and R separately
// positions[0] = left side, positions[1] = right side (when paired)
export const HOLDS = [
  {
    id: 1,
    name: '#1 Outer Jugs',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    depthMm: null,
    depth: 'jug',
    difficulty: 1,
    oneHanded: false,
    description: 'Large jug rail at the outer edges — easiest hold',
    positions: [
      { x: 7.5, y: 29, w: 7, h: 12 },
      { x: 92.5, y: 29, w: 7, h: 12 },
    ],
  },
  {
    id: 2,
    name: '#2 Flat Slopers (55mm)',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    depthMm: 55,
    depth: '55mm',
    difficulty: 3,
    oneHanded: false,
    description: '55mm flat slopers — requires open-hand technique',
    positions: [
      { x: 22, y: 31, w: 10, h: 10 },
      { x: 78, y: 31, w: 10, h: 10 },
    ],
  },
  {
    id: 3,
    name: '#3 Round Slopers (65mm)',
    type: HOLD_TYPES.SLOPER,
    fingers: 4,
    depthMm: 65,
    depth: '65mm',
    difficulty: 4,
    oneHanded: false,
    description: '65mm round slopers — rounded profile, harder than flat',
    positions: [
      { x: 36, y: 24, w: 9.5, h: 10 },
      { x: 64, y: 24, w: 9.5, h: 10 },
    ],
  },
  {
    id: 4,
    name: '#4 3-Finger Pockets (30mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 30,
    depth: '30mm',
    difficulty: 4,
    oneHanded: false,
    description: '30mm 3-finger pockets on the outer section',
    positions: [
      { x: 8, y: 40.5, w: 9, h: 10 },
      { x: 92, y: 40.5, w: 9, h: 10 },
    ],
  },
  {
    id: 5,
    name: '#5 Edges (25mm)',
    type: HOLD_TYPES.EDGE,
    fingers: 4,
    depthMm: 25,
    depth: '25mm',
    difficulty: 3,
    oneHanded: false,
    description: '25mm edges — medium depth, good for 4-finger training',
    positions: [
      { x: 12.5, y: 52, w: 11, h: 10 },
      { x: 87.5, y: 52, w: 11, h: 10 },
    ],
  },
  {
    id: 6,
    name: '#6 Edges (19mm)',
    type: HOLD_TYPES.EDGE,
    fingers: 4,
    depthMm: 19,
    depth: '19mm',
    difficulty: 5,
    oneHanded: false,
    description: '19mm edges — shallow, intermediate to advanced',
    positions: [
      { x: 25, y: 45.5, w: 8, h: 10 },
      { x: 75, y: 45.5, w: 8, h: 10 },
    ],
  },
  {
    id: 7,
    name: '#7 Edges (36mm)',
    type: HOLD_TYPES.EDGE,
    fingers: 4,
    depthMm: 36,
    depth: '36mm',
    difficulty: 2,
    oneHanded: false,
    description: '36mm edges — deepest edge on the board',
    positions: [
      { x: 37, y: 41.5, w: 10.5, h: 10 },
      { x: 63, y: 41.5, w: 10.5, h: 10 },
    ],
  },
  {
    id: 8,
    name: '#8 3-Finger Pockets (15mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 15,
    depth: '15mm',
    difficulty: 7,
    oneHanded: false,
    description: '15mm 3-finger pockets — shallowest 3-finger pocket, advanced',
    positions: [
      { x: 16, y: 67, w: 6, h: 10 },
      { x: 84, y: 67, w: 6, h: 10 },
    ],
  },
  {
    id: 9,
    name: '#9 3-Finger Pockets (35mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 35,
    depth: '35mm',
    difficulty: 4,
    oneHanded: false,
    description: '35mm 3-finger pockets — deepest side pocket',
    positions: [
      { x: 27, y: 62.5, w: 6, h: 10 },
      { x: 73, y: 62.5, w: 6, h: 10 },
    ],
  },
  {
    id: 10,
    name: '#10 3-Finger Pockets (17mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 17,
    depth: '17mm',
    difficulty: 6,
    oneHanded: false,
    description: '17mm 3-finger pockets — shallow, advanced',
    positions: [
      { x: 38.5, y: 59, w: 6, h: 10 },
      { x: 61.5, y: 59, w: 6, h: 10 },
    ],
  },
  {
    id: 11,
    name: '#11 Edges (14mm)',
    type: HOLD_TYPES.EDGE,
    fingers: 4,
    depthMm: 14,
    depth: '14mm',
    difficulty: 8,
    oneHanded: false,
    description: '14mm edges — shallowest edge on the board, expert',
    positions: [
      { x: 23, y: 80, w: 8.5, h: 10 },
      { x: 77, y: 80, w: 8.5, h: 10 },
    ],
  },
  {
    id: 12,
    name: '#12 2-Finger Pockets (30mm)',
    type: HOLD_TYPES.TWO_FINGER_POCKET,
    fingers: 2,
    depthMm: 30,
    depth: '30mm',
    difficulty: 7,
    oneHanded: false,
    description: '30mm 2-finger pockets — deep 2-finger',
    positions: [
      { x: 33, y: 76, w: 6, h: 10 },
      { x: 67, y: 76, w: 6, h: 10 },
    ],
  },
  {
    id: 13,
    name: '#13 2-Finger Pockets (14mm)',
    type: HOLD_TYPES.TWO_FINGER_POCKET,
    fingers: 2,
    depthMm: 14,
    depth: '14mm',
    difficulty: 9,
    oneHanded: false,
    description: '14mm 2-finger pockets — shallowest 2-finger, expert',
    positions: [
      { x: 41, y: 73, w: 6, h: 10 },
      { x: 59, y: 73, w: 6, h: 10 },
    ],
  },
  {
    id: 14,
    name: '#14 Center Jug',
    type: HOLD_TYPES.JUG,
    fingers: 4,
    depthMm: null,
    depth: 'jug',
    difficulty: 1,
    oneHanded: true,
    description: 'Center jug at the top — one hand at a time',
    positions: [
      { x: 51, y: 12, w: 9, h: 12 },
    ],
  },
  {
    id: 15,
    name: '#15 3-Finger Pocket (50mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 50,
    depth: '50mm',
    difficulty: 2,
    oneHanded: true,
    description: '50mm 3-finger pocket — center, one hand at a time',
    positions: [
      { x: 51, y: 24, w: 10.5, h: 10 },
    ],
  },
  {
    id: 16,
    name: '#16 3-Finger Pocket (37mm)',
    type: HOLD_TYPES.THREE_FINGER_POCKET,
    fingers: 3,
    depthMm: 37,
    depth: '37mm',
    difficulty: 4,
    oneHanded: true,
    description: '37mm 3-finger pocket — center, one hand at a time',
    positions: [
      { x: 50.5, y: 42.5, w: 8.5, h: 10 },
    ],
  },
  {
    id: 17,
    name: '#17 2-Finger Pocket (28mm)',
    type: HOLD_TYPES.TWO_FINGER_POCKET,
    fingers: 2,
    depthMm: 28,
    depth: '28mm',
    difficulty: 7,
    oneHanded: true,
    description: '28mm 2-finger pocket — center, one hand at a time',
    positions: [
      { x: 51, y: 59.5, w: 8, h: 10 },
    ],
  },
  {
    id: 18,
    name: '#18 2-Finger Pocket (32mm)',
    type: HOLD_TYPES.TWO_FINGER_POCKET,
    fingers: 2,
    depthMm: 32,
    depth: '32mm',
    difficulty: 6,
    oneHanded: true,
    description: '32mm 2-finger pocket — center, one hand at a time',
    positions: [
      { x: 51, y: 76, w: 6, h: 10 },
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
