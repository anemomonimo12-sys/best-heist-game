// Midnight Gilt — the night itself: boot, the loop, and every rule
// that turns wandering into a heist. Wren slips in, the wardens walk,
// the lantern-eyes sweep, the alarm breathes up and down, and a floor
// ends at the getaway door with the prize — or in handcuffs.

import { THIEF, CAMERA, ALARM, TOOLS, SCORE, CARPET_SIGHT_FACTOR } from './config.js';
import { FLOORS } from './levels.js';
import { buildFloor, ventAt, moveCircle } from './world.js';
import { createGuard, createCamera, updateGuard, updateCamera, lureGuard } from './actors.js';
import { exposureOf } from './vision.js';
import { createInput } from './input.js';
import { createSoundBank } from './audio.js';
import { drawScene } from './render.js';
import { applyShot, SHOT_FLOOR } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const sound = createSoundBank();

const state = {
  mode: 'title',
  floorIndex: 0,
  world: null,
  thief: { x: 0, y: 0, angle: 0, radius: THIEF.radius, sneaking: false, moving: false },
  guards: [],
  cameras: [],
  alarm: 0,
  alarmPeak: 0,
  alarmWarned: false,
  elapsed: 0,
  floorTake: 0,
  sideLoot: 0,
  toolCosts: 0,
  totalScore: 0,
  coins: 0,
  sparks: 0,
  hasPrize: false,
  crack: 0,
  seen: false,
  objective: '',
  message: '',
  messageT: 0,
  floaters: [],
  tally: null,
  floorCount: FLOORS.length,
  muted: false,
  frozen: false,
  stepT: 0,
  blipT: 0,
  ventCd: 0,
};

function say(text, seconds = 2.6) {
  state.message = text;
  state.messageT = seconds;
}

function floater(x, y, text) {
  state.floaters.push({ x, y, text, t: 0 });
}

function startFloor(index) {
  const def = FLOORS[index];
  state.floorIndex = index;
  state.world = buildFloor(def);
  state.guards = def.guards.map(createGuard);
  state.cameras = def.cameras.map(createCamera);
  state.thief.x = state.world.start.x;
  state.thief.y = state.world.start.y;
  state.thief.angle = -Math.PI / 2;
  state.thief.sneaking = false;
  state.alarm = 0;
  state.alarmPeak = 0;
  state.alarmWarned = false;
  state.elapsed = 0;
  state.floorTake = 0;
  state.sideLoot = 0;
  state.toolCosts = 0;
  state.coins = def.tools.coins;
  state.sparks = def.tools.sparks;
  state.hasPrize = false;
  state.crack = 0;
  state.floaters = [];
  state.objective = `Crack the case — take ${def.prize} ($${def.prizeValue.toLocaleString()})`;
  say(`${def.name}. ${def.prize} waits in its case.`, 3.4);
}

function lightFactor() {
  let f = 1;
  if (state.world.onCarpet(state.thief.x, state.thief.y)) f *= CARPET_SIGHT_FACTOR;
  if (state.thief.sneaking) f *= THIEF.sneakSightFactor;
  if (!state.thief.moving) f *= THIEF.stillSightFactor;
  return f;
}

function runDetection(dt) {
  const factor = lightFactor();
  let fill = 0;
  state.seen = false;
  const observers = [...state.guards, ...state.cameras.filter((c) => c.disabledT <= 0)];
  for (const obs of observers) {
    const exposure = exposureOf(state.world, obs, state.thief) * factor;
    if (exposure > 0) {
      state.seen = true;
      obs.heat = Math.min(1, obs.heat + exposure * dt * 1.7);
      fill += (obs.kind === 'camera' ? ALARM.cameraFillPerSecond : ALARM.guardFillPerSecond) * exposure;
      if (obs.kind === 'guard' && obs.heat > 0.82 && !obs.investigate) {
        lureGuard(obs, state.thief.x, state.thief.y, 1.6);
      }
    } else {
      obs.heat = Math.max(0, obs.heat - dt * 0.28);
    }
  }
  if (state.seen) {
    state.alarm = Math.min(100, state.alarm + fill * dt);
    state.blipT -= dt;
    if (state.blipT <= 0) {
      sound.suspicion();
      state.blipT = 0.85;
    }
    if (state.alarm > 75 && !state.alarmWarned) {
      state.alarmWarned = true;
      sound.alarmBell();
      say('The alarm is about to scream — break their gaze!', 2.2);
    }
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM.drainPerSecond * dt);
    if (state.alarm < 60) state.alarmWarned = false;
  }
  state.alarmPeak = Math.max(state.alarmPeak, state.alarm);
  if (state.alarm >= 100) {
    state.mode = 'busted';
    sound.busted();
  }
}

function throwCoin(at) {
  if (state.coins <= 0) {
    say('No coins left — your pockets are lint and nerve.', 2);
    return;
  }
  if (state.world.solidAtPx(at.x, at.y)) return;
  if (Math.hypot(at.x - state.thief.x, at.y - state.thief.y) > 360) {
    say('Too far to throw a coin.', 1.6);
    return;
  }
  state.coins -= 1;
  state.toolCosts += TOOLS.coinCost;
  sound.coin();
  floater(at.x, at.y, 'clink!');
  for (const guard of state.guards) {
    if (Math.hypot(guard.x - at.x, guard.y - at.y) <= TOOLS.coinLureRadius) {
      lureGuard(guard, at.x, at.y, TOOLS.coinLureSeconds);
    }
  }
}

function sparkCamera() {
  const near = state.cameras.find((c) => c.disabledT <= 0 &&
    Math.hypot(c.x - state.thief.x, c.y - state.thief.y) <= CAMERA.sparkReach);
  if (!near) return;
  if (state.sparks <= 0) {
    say('No sparks left for the lantern-eyes.', 2);
    return;
  }
  state.sparks -= 1;
  state.toolCosts += TOOLS.sparkCost;
  near.disabledT = 9;
  sound.spark();
  floater(near.x, near.y + 16, 'camera dark');
}

function finishFloor() {
  const def = state.world.def;
  const timeBonus = Math.max(0, Math.round(def.parSeconds - state.elapsed)) * SCORE.timeBonusPerSecond;
  const ghostBonus = state.alarmPeak <= ALARM.ghostCeiling ? SCORE.ghostBonus : 0;
  const total = def.prizeValue + state.sideLoot + timeBonus + ghostBonus - state.toolCosts;
  state.tally = {
    prizeName: def.prize,
    prize: def.prizeValue,
    side: state.sideLoot,
    timeBonus,
    ghostBonus,
    toolCosts: state.toolCosts,
    total,
  };
  state.totalScore += total;
  state.mode = 'tally';
  sound.getaway();
}

function updatePlay(dt) {
  state.elapsed += dt;
  const thief = state.thief;
  const move = input.movement();
  thief.sneaking = input.down('ShiftLeft') || input.down('ShiftRight');
  thief.moving = move.x !== 0 || move.y !== 0;
  if (thief.moving) {
    const speed = thief.sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
    const moved = moveCircle(state.world, thief.x, thief.y, thief.radius,
      move.x * speed * dt, move.y * speed * dt);
    thief.x = moved.x;
    thief.y = moved.y;
    thief.angle = Math.atan2(move.y, move.x);
    state.stepT -= dt;
    if (state.stepT <= 0) {
      sound.step(thief.sneaking);
      state.stepT = thief.sneaking ? 0.42 : 0.3;
    }
  }

  // loose loot is pocketed by walking over it
  for (const item of state.world.loot) {
    if (!item.taken && Math.hypot(item.x - thief.x, item.y - thief.y) < 24) {
      item.taken = true;
      state.sideLoot += item.value;
      state.floorTake += item.value;
      sound.pickup();
      floater(item.x, item.y - 14, `+$${item.value}`);
    }
  }

  // the prize case: hold E beside it while the tumblers turn
  const prize = state.world.prize;
  state.ventCd -= dt;
  if (prize && !prize.taken && Math.hypot(prize.x - thief.x, prize.y - thief.y) < 34) {
    if (input.down('KeyE')) {
      state.crack = Math.min(1, state.crack + dt / THIEF.crackSeconds);
      if (Math.random() < dt * 6) sound.crackTick();
      if (state.crack >= 1) {
        prize.taken = true;
        state.hasPrize = true;
        state.floorTake += state.world.def.prizeValue;
        state.objective = 'Prize in the sack — reach the GETAWAY door';
        sound.cracked();
        floater(prize.x, prize.y - 24, `${state.world.def.prize} — got it!`);
        say('The case sighs open. Now — the door, quietly.', 3);
      }
    } else {
      state.crack = Math.max(0, state.crack - dt * 1.5);
    }
  } else {
    state.crack = Math.max(0, state.crack - dt * 1.5);
    if (input.pressed('KeyE') && state.ventCd <= 0) {
      const vent = ventAt(state.world, thief.x, thief.y);
      if (vent && vent.other) {
        thief.x = vent.other.x;
        thief.y = vent.other.y;
        state.ventCd = 0.6;
        sound.vent();
        floater(thief.x, thief.y - 18, 'through the vents…');
      }
    }
  }

  if (input.pressed('KeyQ')) sparkCamera();
  const click = input.takeClick();
  if (click) throwCoin(click);

  // the getaway door only opens for a thief carrying the prize
  const exit = state.world.exit;
  if (exit && Math.hypot(exit.x - thief.x, exit.y - thief.y) < 22) {
    if (state.hasPrize) {
      finishFloor();
      return;
    }
    if (state.messageT <= 0) say('The van waits — but the prize case is still full.', 2.4);
  }

  runDetection(dt);
  if (state.mode !== 'play') return;
  for (const guard of state.guards) updateGuard(guard, state.world, dt);
  for (const camera of state.cameras) updateCamera(camera, dt, state.elapsed);
}

function update(dt) {
  state.messageT -= dt;
  if (state.messageT <= 0) state.message = '';
  for (const f of state.floaters) f.t += dt;
  state.floaters = state.floaters.filter((f) => f.t < 1.4);

  if (input.pressed('KeyM')) {
    state.muted = sound.toggleMute();
  }
  // clicks on menu screens are conversation, not coin throws
  if (state.mode !== 'play') input.takeClick();

  if (state.mode === 'title') {
    state.elapsed += dt;
    for (const guard of state.guards) updateGuard(guard, state.world, dt);
    for (const camera of state.cameras) updateCamera(camera, dt, state.elapsed);
    if (input.pressed('Enter')) {
      sound.unlock();
      state.totalScore = 0;
      startFloor(0);
      state.mode = 'play';
    }
  } else if (state.mode === 'play') {
    if (input.pressed('KeyP') || input.pressed('Escape')) {
      state.mode = 'paused';
    } else {
      updatePlay(dt);
    }
  } else if (state.mode === 'paused') {
    if (input.pressed('KeyP') || input.pressed('Escape')) state.mode = 'play';
  } else if (state.mode === 'tally') {
    if (input.pressed('Enter')) {
      if (state.floorIndex + 1 < FLOORS.length) {
        startFloor(state.floorIndex + 1);
        state.mode = 'play';
      } else {
        state.mode = 'finale';
      }
    }
  } else if (state.mode === 'busted') {
    if (input.pressed('Enter')) {
      startFloor(state.floorIndex);
      state.mode = 'play';
    }
  } else if (state.mode === 'finale') {
    if (input.pressed('Enter')) {
      state.totalScore = 0;
      startFloor(0);
      state.mode = 'title';
    }
  }
  input.endFrame();
}

// --- boot -----------------------------------------------------------------
window.__game = state; // a handle for play-testing and the shot poses
window.addEventListener('keydown', () => sound.unlock());
canvas.addEventListener('mousedown', () => sound.unlock());
startFloor(0);
state.mode = 'title';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot && SHOT_FLOOR[shot] !== undefined) {
  startFloor(SHOT_FLOOR[shot]);
  applyShot(state, shot);
  state.frozen = true;
  drawScene(ctx, state);
  window.__shotReady = true;
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    drawScene(ctx, state);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
