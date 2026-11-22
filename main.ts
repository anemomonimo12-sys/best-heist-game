// Midnight Gilt — the hand-in. The game itself is the static site in
// game/ (open game/index.html in a browser and play; no build step,
// no network). This program is what make.fun runs: it carries game/
// and screenshots/ into the output directory and writes dossier.json
// with the kit's own library, so the judge reads exactly the files
// that were handed in.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// With no MAKEFUN_OUTPUT_DIR it writes to /output, as in the grader.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own limits, restated so a bad hand-in fails here with a
// plain message instead of failing silently on the server.
const GATE = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function countEntries(dir: string): number {
  let n = 0;
  for (const name of readdirSync(dir)) {
    n += 1;
    if (statSync(join(dir, name)).isDirectory()) n += countEntries(join(dir, name));
  }
  return n;
}

const shotsDir = join(repoDir, 'screenshots');
const shotNames = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((n) => /\.(png|jpe?g)$/i.test(n))
  : [];
if (shotNames.length < 3 || shotNames.length > GATE.screenshots.max) {
  throw new Error(`screenshots/ must hold 3 or 4 images; found ${shotNames.length}`);
}
for (const name of shotNames) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > GATE.screenshots.max_bytes) {
    throw new Error(`screenshot ${name} is ${size} bytes; the cap is ${GATE.screenshots.max_bytes}`);
  }
}
const gameEntries = countEntries(join(repoDir, 'game'));
if (gameEntries > GATE.game_max_files) {
  throw new Error(`game/ holds ${gameEntries} entries; the cap is ${GATE.game_max_files}`);
}

mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, GATE));
console.log(`handed in: game/ (${gameEntries} entries), ${shotNames.length} screenshots, dossier.json`);
