// Midnight Gilt — posed frames for the maker's screenshots. Opening
// the game with ?shot=<name> starts the named floor and arranges a
// real moment of play — the thief mid-crossing, a case half-cracked,
// the run for the door — then freezes it for the camera. Every pixel
// is the game's own renderer over its own state; nothing is drawn
// here that the game does not draw itself.

import { tileCenter } from './world.js';

export const SHOT_FLOOR = { cover: 0, vault: 1, getaway: 2, counting: 1 };

function placeThief(state, col, row, angle, extra = {}) {
  const c = tileCenter(col, row);
  state.thief.x = c.x;
  state.thief.y = c.y;
  state.thief.angle = angle;
  Object.assign(state.thief, extra);
}

function placeGuard(state, index, col, row, angle, heat) {
  const g = state.guards[index];
  if (!g) return;
  const c = tileCenter(col, row);
  g.x = c.x;
  g.y = c.y;
  g.angle = angle;
  g.heat = heat;
  g.pauseT = 99;
}

export function applyShot(state, name) {
  state.mode = 'play';
  if (name === 'cover') {
    // Floor one, mid-crossing: Wren on the carpet run with a goblet
    // already lifted, one warden's lamp swinging onto the runner.
    state.elapsed = 41;
    placeThief(state, 13, 7, 0.15);
    placeGuard(state, 0, 9, 3, 0.55, 0.52);
    placeGuard(state, 1, 24, 15, Math.PI, 0.18);
    state.cameras[0].angle = 0.8;
    state.alarm = 34;
    state.floorTake = 850;
    state.sideLoot = 850;
  } else if (name === 'vault') {
    // Floor two: the Tsar's Egg half-cracked while a warden crosses
    // the carpet room behind, certain he saw something move.
    state.elapsed = 63;
    placeThief(state, 29, 1, 0);
    state.crack = 0.55;
    placeGuard(state, 0, 5, 8, 0.8, 0.42);
    placeGuard(state, 1, 11, 2, 2.65, 0.78);
    placeGuard(state, 2, 23, 13, -1.2, 0.1);
    state.cameras[0].angle = 0.75;
    state.cameras[1].angle = 2.5;
    state.alarm = 47;
    state.seen = true;
    state.floorTake = 1150;
    state.sideLoot = 1150;
    state.coins = 2;
  } else if (name === 'getaway') {
    // Floor three: the Star is in the sack, the alarm is screaming,
    // and the getaway door is four tiles of open floor away.
    state.elapsed = 118;
    state.world.prize.taken = true;
    state.hasPrize = true;
    state.objective = 'Prize in the sack — reach the GETAWAY door';
    state.message = 'The Star is in the sack — now run for the door!';
    state.seen = true;
    placeThief(state, 27, 15, 0.85);
    placeGuard(state, 0, 20, 9, 0.2, 0.3);
    placeGuard(state, 1, 15, 1, 1.4, 0.15);
    placeGuard(state, 2, 4, 14, 0.1, 0.4);
    placeGuard(state, 3, 25, 13, 2.8, 0.92);
    state.cameras[0].angle = 1.6;
    state.cameras[1].angle = 1.4;
    state.cameras[2].angle = -1.3;
    state.alarm = 71;
    state.floorTake = 4300;
    state.sideLoot = 800;
    state.coins = 1;
    state.sparks = 1;
  } else if (name === 'counting') {
    // Floor two again, quieter: a sneak across the carpet under a
    // curious warden's lamp, a painting waiting on the far wall.
    state.elapsed = 27;
    placeThief(state, 14, 8, -0.4, { sneaking: true });
    placeGuard(state, 0, 8, 6, 0.85, 0.45);
    placeGuard(state, 1, 16, 2, 3.1, 0.05);
    placeGuard(state, 2, 23, 12, -2.2, 0);
    state.cameras[0].angle = 0.95;
    state.cameras[1].angle = 2.2;
    state.alarm = 18;
    state.floorTake = 300;
    state.sideLoot = 300;
    state.sparks = 1;
  }
}
