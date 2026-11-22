// Midnight Gilt — everything the eye gets: the gallery's marble and
// carpet, cones of lamplight swept by raycast so they bend around the
// display cases, the wardens, the cameras, Wren, and the HUD with its
// alarm meter. Overlay panels carry the title, the tally and the
// busted screen; the game underneath never stops being the picture.

import { TILE, COLS, ROWS, HUD_HEIGHT, VIEW_W, VIEW_H, PALETTE as P } from './config.js';
import { tileAtPx } from './world.js';

function rayLength(world, x, y, angle, maxDist, startAt = 0) {
  const step = 6;
  let d = startAt;
  while (d < maxDist) {
    d += step;
    if (world.solidAtPx(x + Math.cos(angle) * d, y + Math.sin(angle) * d)) return d;
  }
  return maxDist;
}

function drawCone(ctx, world, observer, fill, startAt = 0) {
  const rays = 26;
  ctx.beginPath();
  ctx.moveTo(observer.x, observer.y);
  for (let i = 0; i <= rays; i++) {
    const a = observer.angle - observer.halfAngle + (observer.halfAngle * 2 * i) / rays;
    const d = rayLength(world, observer.x, observer.y, a, observer.range, startAt);
    ctx.lineTo(observer.x + Math.cos(a) * d, observer.y + Math.sin(a) * d);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(observer.x, observer.y, 8, observer.x, observer.y, observer.range);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawTiles(ctx, world, elapsed) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ch = world.tiles[row][col];
      const x = col * TILE;
      const y = HUD_HEIGHT + row * TILE;
      if (ch === '#') {
        ctx.fillStyle = P.wall;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(232,182,76,0.16)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 3.5, y + 3.5, TILE - 7, TILE - 7);
        continue;
      }
      const carpet = ch === ',';
      ctx.fillStyle = carpet ? P.carpet : (col + row) % 2 ? P.floorA : P.floorB;
      ctx.fillRect(x, y, TILE, TILE);
      if (carpet) {
        ctx.strokeStyle = P.carpetEdge;
        ctx.strokeRect(x + 2.5, y + 2.5, TILE - 5, TILE - 5);
      } else {
        // a gilt diamond inlaid in the marble, gallery-style
        ctx.fillStyle = 'rgba(232,182,76,0.10)';
        ctx.beginPath();
        ctx.moveTo(x + TILE / 2, y + 6);
        ctx.lineTo(x + TILE - 6, y + TILE / 2);
        ctx.lineTo(x + TILE / 2, y + TILE - 6);
        ctx.lineTo(x + 6, y + TILE / 2);
        ctx.closePath();
        ctx.fill();
      }
      if (ch === 'B') {
        ctx.fillStyle = P.cover;
        ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.strokeStyle = P.coverTrim;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
        ctx.fillStyle = 'rgba(190,215,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + TILE - 10);
        ctx.lineTo(x + TILE - 14, y + 10);
        ctx.lineTo(x + TILE - 9, y + 10);
        ctx.lineTo(x + 15, y + TILE - 10);
        ctx.closePath();
        ctx.fill();
      } else if (ch === 'D') {
        ctx.fillStyle = P.door;
        ctx.fillRect(x + 2, y, TILE - 4, TILE);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + TILE / 2 - 1, y + 4, 2, TILE - 8);
      } else if (ch === 'V') {
        ctx.fillStyle = P.vent;
        ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
        ctx.fillStyle = '#232838';
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 9, y + 11 + i * 8, TILE - 18, 3);
      } else if (ch === 'E') {
        ctx.fillStyle = P.exit;
        ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = '#bff5dd';
        ctx.font = 'bold 8px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('GETAWAY', x + TILE / 2, y + TILE / 2 + 3);
      }
    }
  }
  // the prize case: gold pedestal, glass dome, and the prize itself
  if (world.prize && !world.prize.taken) {
    const { x, y } = world.prize;
    const pulse = 0.75 + Math.sin(elapsed * 3) * 0.25;
    ctx.fillStyle = `rgba(255,217,104,${0.20 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a24';
    ctx.fillRect(x - 13, y + 6, 26, 9);
    ctx.strokeStyle = P.loot;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 15, y - 16, 30, 31);
    ctx.fillStyle = P.loot;
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x + 9, y - 2);
    ctx.lineTo(x + 4, y + 8);
    ctx.lineTo(x - 4, y + 8);
    ctx.lineTo(x - 9, y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(x - 1.5, y - 9, 3, 12);
  }
}

const LOOT_DRAW = {
  g(ctx, x, y) { // goblet
    ctx.fillStyle = P.loot;
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 8);
    ctx.quadraticCurveTo(x, y + 4, x + 7, y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 1.5, y + 2, 3, 6);
    ctx.fillRect(x - 6, y + 8, 12, 2.5);
  },
  p(ctx, x, y) { // painting in a gilt frame
    ctx.fillStyle = '#8a6a24';
    ctx.fillRect(x - 11, y - 9, 22, 18);
    ctx.fillStyle = '#33526b';
    ctx.fillRect(x - 8, y - 6, 16, 12);
    ctx.fillStyle = '#7fb069';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 6);
    ctx.lineTo(x - 2, y - 2);
    ctx.lineTo(x + 3, y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe9a3';
    ctx.beginPath();
    ctx.arc(x + 4, y - 3, 2.4, 0, Math.PI * 2);
    ctx.fill();
  },
  j(ctx, x, y) { // cut jewel
    ctx.fillStyle = '#9be7ff';
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 8, y - 1);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x - 8, y - 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 8, y - 1);
    ctx.lineTo(x, y + 1);
    ctx.closePath();
    ctx.fill();
  },
};

function drawLoot(ctx, world, elapsed) {
  for (const item of world.loot) {
    if (item.taken) continue;
    const bob = Math.sin(elapsed * 2.4 + item.col) * 1.6;
    ctx.fillStyle = 'rgba(255,217,104,0.16)';
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 15, 0, Math.PI * 2);
    ctx.fill();
    LOOT_DRAW[item.kind](ctx, item.x, item.y + bob);
  }
}

function drawGuard(ctx, guard) {
  const { x, y } = guard;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 11, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.guard;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.guardDark;
  ctx.beginPath();
  ctx.arc(x, y, 13, guard.angle + 2.2, guard.angle - 2.2, true);
  ctx.fill();
  ctx.fillStyle = '#f2d8c9';
  ctx.beginPath();
  ctx.arc(x + Math.cos(guard.angle) * 5, y + Math.sin(guard.angle) * 5, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.guardDark;
  ctx.fillRect(x + Math.cos(guard.angle) * 8 - 6, y + Math.sin(guard.angle) * 8 - 9, 12, 5);
  if (guard.heat > 0.66) drawMark(ctx, x, y - 26, '!', '#ff5a4d');
  else if (guard.heat > 0.25) drawMark(ctx, x, y - 26, '?', '#ffd968');
}

function drawMark(ctx, x, y, mark, color) {
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(mark, x, y);
}

function drawCamera(ctx, camera, elapsed) {
  const { x, y } = camera;
  ctx.fillStyle = '#59637e';
  ctx.fillRect(x - 10, y - 7, 20, 14);
  ctx.fillStyle = camera.disabledT > 0 ? '#39415a' : P.cameraBody;
  ctx.beginPath();
  ctx.arc(x + Math.cos(camera.angle) * 4, y + Math.sin(camera.angle) * 4, 6.5, 0, Math.PI * 2);
  ctx.fill();
  if (camera.disabledT > 0) {
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8fa3d9';
    ctx.fillText('z z', x + 12, y - 10);
  } else if (Math.sin(elapsed * 4) > 0) {
    ctx.fillStyle = '#ff5a4d';
    ctx.beginPath();
    ctx.arc(x - 7, y - 10, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawThief(ctx, thief, state) {
  const { x, y } = thief;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + 11, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // a ring of lamplight so Wren reads against carpet and marble alike
  ctx.strokeStyle = 'rgba(255,240,200,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, (thief.sneaking ? 11.5 : 13) + 2.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#4d5c85';
  ctx.beginPath();
  ctx.arc(x, y, thief.sneaking ? 11.5 : 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.thief;
  ctx.beginPath();
  ctx.arc(x + Math.cos(thief.angle) * 4, y + Math.sin(thief.angle) * 4, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // flat cap, brim toward facing
  ctx.fillStyle = '#232838';
  ctx.beginPath();
  ctx.arc(x, y, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(
    x + Math.cos(thief.angle) * 9 - 4.5, y + Math.sin(thief.angle) * 9 - 2, 9, 4);
  if (state.hasPrize) {
    ctx.fillStyle = P.loot;
    ctx.beginPath();
    ctx.arc(x - Math.cos(thief.angle) * 11, y - Math.sin(thief.angle) * 11, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (state.crack > 0) {
    ctx.strokeStyle = P.loot;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, -Math.PI / 2, -Math.PI / 2 + state.crack * Math.PI * 2);
    ctx.stroke();
  }
}

function drawMeter(ctx, x, y, w, label, frac, color) {
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillStyle = P.textDim;
  ctx.fillText(label, x, y - 5);
  ctx.fillStyle = P.alarmTrack;
  ctx.fillRect(x, y, w, 13);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, 13);
  ctx.strokeStyle = 'rgba(239,233,214,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 12);
}

export function drawHud(ctx, state) {
  ctx.fillStyle = '#0d1122';
  ctx.fillRect(0, 0, VIEW_W, HUD_HEIGHT);
  ctx.fillStyle = P.wallTrim;
  ctx.fillRect(0, HUD_HEIGHT - 2, VIEW_W, 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8b64c';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('MIDNIGHT GILT', 16, 28);
  ctx.fillStyle = P.text;
  ctx.font = '14px Georgia, serif';
  ctx.fillText(state.world.def.name, 16, 52);
  ctx.fillStyle = P.textDim;
  ctx.font = '12px Georgia, serif';
  ctx.fillText(state.objective, 250, 52);

  const alarm = state.alarm;
  const color = alarm > 66 ? '#e04034' : alarm > 33 ? '#e8933c' : '#7fb069';
  drawMeter(ctx, 470, 26, 330, `ALARM — ${state.seen ? 'THEY SEE YOU' : 'all quiet'}`, alarm / 100, color);
  if (alarm > 75 && Math.sin(state.elapsed * 10) > 0) {
    ctx.strokeStyle = '#e04034';
    ctx.lineWidth = 2;
    ctx.strokeRect(468, 24, 334, 17);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = P.text;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`TAKE $${state.floorTake.toLocaleString()}`, 1010, 30);
  ctx.fillStyle = P.textDim;
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`SCORE $${state.totalScore.toLocaleString()}`, 1010, 54);
  ctx.fillStyle = P.text;
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`● coin ×${state.coins}    ⚡ spark ×${state.sparks}    ${state.muted ? '♪ off' : '♪ on'}`, 1264, 30);
  ctx.fillStyle = P.textDim;
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`${Math.floor(state.elapsed / 60)}:${String(Math.floor(state.elapsed % 60)).padStart(2, '0')} on the floor`, 1264, 54);
}

function panel(ctx, w, h) {
  ctx.fillStyle = 'rgba(6,8,18,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#141a33';
  const x = (VIEW_W - w) / 2;
  const y = (VIEW_H - h) / 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = P.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  return { x, y };
}

function centred(ctx, text, y, font, color) {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW_W / 2, y);
}

function drawTitle(ctx, state) {
  const { y } = panel(ctx, 760, 560);
  centred(ctx, 'MIDNIGHT GILT', y + 92, 'bold 58px Georgia, serif', '#e8b64c');
  centred(ctx, '— the Meridian Gallery job —', y + 128, 'italic 19px Georgia, serif', P.textDim);
  const lines = [
    'Wren the thief has three floors, one night, and a list:',
    'the Empress Tiara, the Tsar\'s Egg, and the Star of Meridian.',
    '',
    'Cross each gallery under the wardens\' lamplight. Stay out of the',
    'cones, mind the sweeping lantern-eyes, and keep the ALARM down.',
    'Deep carpet swallows sound and sight. Vents go where doors cannot.',
    'A thrown coin ($150) buys a guard\'s attention; a spark ($250)',
    'puts a camera to sleep. Crack the prize case, then reach the',
    'getaway door. Clean and unseen pays best.',
    '',
    'WASD / arrows — move      Shift — sneak      E — crack case / vent',
    'Click — throw a coin      Q — spark a camera      P — pause',
  ];
  ctx.font = '16.5px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = P.text;
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, y + 178 + i * 25));
  centred(ctx, 'Press ENTER to slip inside', y + 516, 'bold 19px Georgia, serif', '#ffd968');
}

function drawTally(ctx, state) {
  const { y } = panel(ctx, 620, 470);
  const t = state.tally;
  centred(ctx, 'FLOOR CLEARED', y + 66, 'bold 34px Georgia, serif', '#7fb069');
  centred(ctx, `${t.prizeName} — away in the sack`, y + 100, 'italic 16px Georgia, serif', P.textDim);
  const rows = [
    ['Headline prize', t.prize],
    ['Side loot', t.side],
    ['Time bonus', t.timeBonus],
    ['Ghost bonus (alarm stayed low)', t.ghostBonus],
    ['Tools spent', -t.toolCosts],
    ['Floor total', t.total],
  ];
  ctx.font = '18px Georgia, serif';
  rows.forEach(([label, value], i) => {
    const yy = y + 152 + i * 36;
    ctx.textAlign = 'left';
    ctx.fillStyle = P.text;
    ctx.fillText(label, VIEW_W / 2 - 250, yy);
    ctx.textAlign = 'right';
    ctx.fillStyle = value < 0 ? '#ff8a7a' : '#ffd968';
    ctx.fillText(`$${value.toLocaleString()}`, VIEW_W / 2 + 250, yy);
  });
  centred(ctx, `Running score $${state.totalScore.toLocaleString()}`, y + 396, 'bold 18px Georgia, serif', P.text);
  centred(ctx, state.floorIndex + 1 < state.floorCount ? 'Press ENTER for the next floor' : 'Press ENTER for the last door home', y + 434, 'bold 17px Georgia, serif', '#ffd968');
}

function drawBusted(ctx, state) {
  ctx.fillStyle = 'rgba(90,10,6,0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const { y } = panel(ctx, 620, 300);
  centred(ctx, 'BUSTED', y + 92, 'bold 52px Georgia, serif', '#ff5a4d');
  centred(ctx, 'The alarm hit a full scream and the wardens closed in.', y + 140, '16.5px Georgia, serif', P.text);
  centred(ctx, 'The floor\'s take is lost — the night is not.', y + 170, '16.5px Georgia, serif', P.textDim);
  centred(ctx, 'Press ENTER to try the floor again', y + 246, 'bold 18px Georgia, serif', '#ffd968');
}

export function rankTitle(score) {
  if (score >= 15000) return 'GHOST OF THE MERIDIAN';
  if (score >= 11000) return 'MASTER OF THE QUIET HOUR';
  if (score >= 7000) return 'PROFESSIONAL, SECOND STOREY';
  if (score >= 3500) return 'LIGHT-FINGERED';
  return 'SMASH-AND-GRAB ARTIST';
}

function drawFinale(ctx, state) {
  const { y } = panel(ctx, 680, 430);
  centred(ctx, 'A CLEAN GETAWAY', y + 80, 'bold 40px Georgia, serif', '#7fb069');
  centred(ctx, 'Three floors emptied, one van, no sirens worth the name.', y + 118, 'italic 16px Georgia, serif', P.textDim);
  centred(ctx, `Final score  $${state.totalScore.toLocaleString()}`, y + 190, 'bold 30px Georgia, serif', '#ffd968');
  centred(ctx, 'The papers will call you', y + 258, '16px Georgia, serif', P.textDim);
  centred(ctx, rankTitle(state.totalScore), y + 300, 'bold 26px Georgia, serif', '#e8b64c');
  centred(ctx, 'Press ENTER to work the gallery again', y + 380, 'bold 17px Georgia, serif', P.text);
}

export function drawScene(ctx, state) {
  const { world } = state;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawTiles(ctx, world, state.elapsed);
  drawLoot(ctx, world, state.elapsed);

  for (const camera of state.cameras) {
    if (camera.disabledT <= 0) {
      // a camera sits inside its wall tile: its rays start past the stone
      drawCone(ctx, world, camera, camera.heat > 0.25 ? P.cameraConeHot : P.cameraCone, 30);
    }
  }
  for (const guard of state.guards) {
    drawCone(ctx, world, guard, guard.heat > 0.25 ? P.coneHot : P.coneCalm);
  }
  for (const camera of state.cameras) drawCamera(ctx, camera, state.elapsed);
  for (const guard of state.guards) drawGuard(ctx, guard);
  if (state.mode !== 'title') drawThief(ctx, state.thief, state);

  // prize label, so the target reads at a glance
  if (world.prize && !world.prize.taken && state.mode !== 'title') {
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd968';
    ctx.fillText(world.def.prize.toUpperCase(), world.prize.x, world.prize.y + 34);
  }

  for (const f of state.floaters) {
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,217,104,${Math.max(0, 1 - f.t / 1.4)})`;
    ctx.fillText(f.text, f.x, f.y - f.t * 26);
  }

  drawHud(ctx, state);
  if (state.message && state.mode === 'play') {
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd968';
    ctx.fillText(state.message, VIEW_W / 2, HUD_HEIGHT + 24);
  }
  if (state.mode === 'paused') {
    ctx.fillStyle = 'rgba(6,8,18,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    centred(ctx, 'PAUSED — the gallery holds its breath', VIEW_H / 2, 'bold 26px Georgia, serif', P.text);
  }
  if (state.mode === 'title') drawTitle(ctx, state);
  if (state.mode === 'tally') drawTally(ctx, state);
  if (state.mode === 'busted') drawBusted(ctx, state);
  if (state.mode === 'finale') drawFinale(ctx, state);

  // vignette
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.42, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

export { tileAtPx };
