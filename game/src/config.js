// Midnight Gilt — tuning constants and the art palette.
// Every number the game feel depends on lives here, so the rest of the
// code can talk about "the guard's reach" instead of magic pixels.

export const TILE = 40;               // one floor tile, in pixels
export const COLS = 32;               // room width in tiles
export const ROWS = 18;               // room height in tiles
export const HUD_HEIGHT = 72;         // top strip reserved for the HUD
export const VIEW_W = COLS * TILE;    // 1280
export const VIEW_H = ROWS * TILE + HUD_HEIGHT; // 792

export const THIEF = {
  radius: 13,
  walkSpeed: 158,        // px per second on foot
  sneakSpeed: 88,        // px per second while sneaking (Shift)
  sneakSightFactor: 0.55, // how much sneaking shrinks your profile
  stillSightFactor: 0.8,  // standing still helps a little
  crackSeconds: 2.0,      // hold E this long at the vault case
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 64,
  chaseSpeed: 118,
  turnRate: 3.4,          // radians per second a guard can swing round
  sightRange: 235,
  sightHalfAngle: 0.62,   // radians; the full cone is about 71 degrees
  pauseSeconds: 1.1,      // beat at each waypoint before moving on
  investigateSeconds: 2.0,
};

export const CAMERA = {
  sightRange: 205,
  sightHalfAngle: 0.5,
  sweepArc: 0.95,         // radians either side of its centre heading
  sweepPeriod: 6.5,       // seconds for a full sweep cycle
  sparkSeconds: 9,        // how long a sparked camera stays dark
  sparkReach: 78,         // stand this close to its base to spark it
};

export const ALARM = {
  guardFillPerSecond: 30,   // at point blank, wide awake, in the light
  cameraFillPerSecond: 21,
  drainPerSecond: 15,       // when nobody can see you
  ghostCeiling: 45,         // finish under this for the ghost bonus
};

export const TOOLS = {
  coinCost: 150,        // deducted from the take when a coin is thrown
  coinLureRadius: 270,  // guards this close hear the clink
  coinLureSeconds: 3.2,
  sparkCost: 250,       // deducted when a camera is sparked
};

export const SCORE = {
  ghostBonus: 1000,
  timeBonusPerSecond: 10,
};

export const CARPET_SIGHT_FACTOR = 0.35; // deep carpet swallows movement

// Art-deco gallery palette: ink navy, gilt gold, crimson carpet.
export const PALETTE = {
  floorA: '#232a4a',
  floorB: '#20264a',
  carpet: '#4a1f33',
  carpetEdge: '#5d2a42',
  wall: '#12162c',
  wallTrim: '#e8b64c',
  cover: '#2e3a63',
  coverTrim: '#8fa3d9',
  door: '#6b4f2a',
  vent: '#3c4356',
  exit: '#1f5c46',
  shadow: 'rgba(5,6,14,0.35)',
  coneCalm: 'rgba(232,182,76,0.20)',
  coneHot: 'rgba(224,64,52,0.34)',
  cameraCone: 'rgba(120,200,255,0.21)',
  cameraConeHot: 'rgba(224,64,52,0.32)',
  loot: '#ffd968',
  thief: '#e8e4d8',
  thiefCoat: '#37415f',
  guard: '#c33d31',
  guardDark: '#7e231c',
  cameraBody: '#aab4cc',
  text: '#efe9d6',
  textDim: '#9aa0bd',
  alarm: '#e04034',
  alarmTrack: '#2a2f4a',
};
