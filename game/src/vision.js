// Midnight Gilt — who can see whom: vision cones and line of sight.
// Walls and display cases block sight; a cone is a range, a heading and
// a half-angle, with a point-blank zone where facing stops mattering.

export function angleDiff(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Turn `angle` toward `target` by at most `maxStep` radians.
export function turnToward(angle, target, maxStep) {
  const d = angleDiff(target, angle);
  if (Math.abs(d) <= maxStep) return target;
  return angle + Math.sign(d) * maxStep;
}

// Walk the segment in small steps; sight is blocked when a step lands
// in a solid tile. The first stretch is skipped: a camera sits inside
// its own wall tile and a guard against a case should still see out.
export function lineBlocked(world, x0, y0, x1, y1) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / 6));
  const skip = Math.min(0.45, 26 / Math.max(dist, 1));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (t < skip || t > 0.94) continue;
    if (world.solidAtPx(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return true;
  }
  return false;
}

// Full sight test for one observer ({x, y, angle, range, halfAngle})
// against the thief. Returns 0 when unseen, else an exposure between
// 0 and 1 that grows as the thief gets closer to the observer.
export function exposureOf(world, observer, thief) {
  const dx = thief.x - observer.x;
  const dy = thief.y - observer.y;
  const dist = Math.hypot(dx, dy);
  if (dist > observer.range) return 0;
  if (dist > 30) {
    const facing = Math.atan2(dy, dx);
    if (Math.abs(angleDiff(facing, observer.angle)) > observer.halfAngle) return 0;
  }
  if (lineBlocked(world, observer.x, observer.y, thief.x, thief.y)) return 0;
  return Math.min(1, 1.18 - dist / observer.range);
}
