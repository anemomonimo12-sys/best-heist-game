// Midnight Gilt — the floor as data: parsing the text plan, tile
// queries, and sliding a round thief along walls and display cases.

import { TILE, COLS, ROWS, HUD_HEIGHT } from './config.js';
import { LOOT_VALUES } from './levels.js';

export const SOLID_TILES = new Set(['#', 'B']);

export const tileCenter = (col, row) => ({
  x: col * TILE + TILE / 2,
  y: HUD_HEIGHT + row * TILE + TILE / 2,
});

export const tileAtPx = (x, y) => ({
  col: Math.floor(x / TILE),
  row: Math.floor((y - HUD_HEIGHT) / TILE),
});

// Turn one floor definition into everything a run needs: the tile grid,
// the thief's entry, the getaway door, the prize case, loose loot and
// the vent pairs (grates pair up in reading order: 1st with 2nd, ...).
export function buildFloor(def) {
  const tiles = def.map.map((row) => row.split(''));
  const world = {
    def,
    tiles,
    start: null,
    exit: null,
    prize: null,
    loot: [],
    vents: [],
    tile(col, row) {
      if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return '#';
      return this.tiles[row][col];
    },
    charAtPx(x, y) {
      const { col, row } = tileAtPx(x, y);
      return this.tile(col, row);
    },
    solidAtPx(x, y) {
      return SOLID_TILES.has(this.charAtPx(x, y));
    },
    onCarpet(x, y) {
      return this.charAtPx(x, y) === ',';
    },
  };

  const grates = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ch = tiles[row][col];
      const c = tileCenter(col, row);
      if (ch === 'T') world.start = { ...c, col, row };
      else if (ch === 'E') world.exit = { ...c, col, row };
      else if (ch === '*') world.prize = { ...c, col, row, taken: false };
      else if (ch === 'V') grates.push({ ...c, col, row });
      else if (LOOT_VALUES[ch]) {
        world.loot.push({ ...c, col, row, kind: ch, value: LOOT_VALUES[ch], taken: false });
      }
    }
  }
  for (let i = 0; i + 1 < grates.length; i += 2) {
    grates[i].other = grates[i + 1];
    grates[i + 1].other = grates[i];
    world.vents.push(grates[i], grates[i + 1]);
  }
  return world;
}

// The vent grate under a point, if any (standing on it and pressing E
// pops the thief out of its pair, somewhere quieter — or worse).
export function ventAt(world, x, y) {
  const { col, row } = tileAtPx(x, y);
  return world.vents.find((v) => v.col === col && v.row === row) ?? null;
}

// Move a circle by (dx, dy), one axis at a time so it slides along
// walls instead of sticking to them. Returns the new position.
export function moveCircle(world, x, y, radius, dx, dy) {
  const hitsSolid = (cx, cy) => {
    const probes = [
      [cx - radius, cy], [cx + radius, cy], [cx, cy - radius], [cx, cy + radius],
      [cx - radius * 0.72, cy - radius * 0.72], [cx + radius * 0.72, cy - radius * 0.72],
      [cx - radius * 0.72, cy + radius * 0.72], [cx + radius * 0.72, cy + radius * 0.72],
    ];
    return probes.some(([px, py]) => world.solidAtPx(px, py));
  };
  let nx = x + dx;
  if (hitsSolid(nx, y)) nx = x;
  let ny = y + dy;
  if (hitsSolid(nx, ny)) ny = y;
  return { x: nx, y: ny };
}
