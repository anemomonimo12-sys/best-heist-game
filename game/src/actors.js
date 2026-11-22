// Midnight Gilt — the wardens and the lantern-eyes: guards who walk a
// patrol, pause, and go to look at anything that glints or rings, and
// cameras that sweep their arc until a spark puts them to sleep.

import { GUARD, CAMERA } from './config.js';
import { tileCenter } from './world.js';
import { angleDiff, turnToward } from './vision.js';
import { moveCircle } from './world.js';

export function createGuard(def) {
  const [col, row] = def.path[0];
  const start = tileCenter(col, row);
  const next = def.path.length > 1 ? tileCenter(def.path[1][0], def.path[1][1]) : start;
  return {
    kind: 'guard',
    x: start.x,
    y: start.y,
    radius: GUARD.radius,
    range: GUARD.sightRange,
    halfAngle: GUARD.sightHalfAngle,
    angle: Math.atan2(next.y - start.y, next.x - start.x),
    waypoints: def.path.map(([c, r]) => tileCenter(c, r)),
    wpIndex: 1 % def.path.length,
    pauseT: 0,
    heat: 0,            // 0 calm .. 1 certain: drives cone colour
    investigate: null,  // {x, y, lookT} — a coin's ring, a glimpse
    stuckT: 0,
    lastX: start.x,
    lastY: start.y,
  };
}

export function createCamera(def) {
  const at = tileCenter(def.at[0], def.at[1]);
  return {
    kind: 'camera',
    x: at.x,
    y: at.y,
    range: CAMERA.sightRange,
    halfAngle: CAMERA.sightHalfAngle,
    baseHeading: def.heading,
    phase: def.phase ?? 0,
    angle: def.heading,
    heat: 0,
    disabledT: 0,
  };
}

// Cameras breathe: heading = centre + sin(time) * arc, so a patient
// thief can time the sweep. A sparked camera hangs dark and still.
export function updateCamera(camera, dt, elapsed) {
  if (camera.disabledT > 0) {
    camera.disabledT -= dt;
    camera.heat = 0;
    return;
  }
  const swing = Math.sin((elapsed * Math.PI * 2) / CAMERA.sweepPeriod + camera.phase);
  camera.angle = camera.baseHeading + swing * CAMERA.sweepArc;
}

// Guards patrol their loop. A lure (coin or glimpse) pulls them off it:
// walk to the spot, look around, then make their way back. Facing
// always turns at a human rate, so a cone can be slipped behind.
export function updateGuard(guard, world, dt) {
  guard.stuckT += dt;
  if (Math.hypot(guard.x - guard.lastX, guard.y - guard.lastY) > 2) {
    guard.stuckT = 0;
    guard.lastX = guard.x;
    guard.lastY = guard.y;
  }

  let target = null;
  let speed = GUARD.patrolSpeed;
  let arrive = 6;

  if (guard.investigate) {
    target = guard.investigate;
    speed = GUARD.chaseSpeed * 0.8;
    arrive = 10;
    if (Math.hypot(target.x - guard.x, target.y - guard.y) <= arrive) {
      guard.investigate.lookT -= dt;
      // Look about the spot, suspicious, then give up on it.
      guard.angle += Math.sin(guard.investigate.lookT * 2.4) * dt * 1.6;
      if (guard.investigate.lookT <= 0) guard.investigate = null;
      return;
    }
  } else if (guard.pauseT > 0) {
    guard.pauseT -= dt;
    const wp = guard.waypoints[guard.wpIndex];
    const ahead = Math.atan2(wp.y - guard.y, wp.x - guard.x);
    guard.angle = turnToward(guard.angle, ahead + Math.sin(guard.pauseT * 1.7) * 0.4, GUARD.turnRate * dt);
    return;
  } else {
    target = guard.waypoints[guard.wpIndex];
    if (Math.hypot(target.x - guard.x, target.y - guard.y) <= arrive) {
      guard.wpIndex = (guard.wpIndex + 1) % guard.waypoints.length;
      guard.pauseT = GUARD.pauseSeconds;
      return;
    }
  }

  // A guard who has not moved in seconds (wedged on a case corner on
  // the way back) quietly steps to his next waypoint instead.
  if (guard.stuckT > 7) {
    const wp = guard.waypoints[guard.wpIndex];
    guard.x = wp.x;
    guard.y = wp.y;
    guard.stuckT = 0;
    guard.investigate = null;
    return;
  }

  const facing = Math.atan2(target.y - guard.y, target.x - guard.x);
  guard.angle = turnToward(guard.angle, facing, GUARD.turnRate * dt);
  const step = Math.min(speed * dt, Math.hypot(target.x - guard.x, target.y - guard.y));
  const moved = moveCircle(world, guard.x, guard.y, guard.radius,
    Math.cos(facing) * step, Math.sin(facing) * step);
  guard.x = moved.x;
  guard.y = moved.y;
}

// Send a guard to look at a point (a coin landing, a half-seen shape).
export function lureGuard(guard, x, y, seconds) {
  guard.investigate = { x, y, lookT: seconds };
  guard.pauseT = 0;
}

export function guardAlertness(guard) {
  return guard.heat > 0.66 ? 'alert' : guard.heat > 0.25 ? 'curious' : 'calm';
}

export { angleDiff };
