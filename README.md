# Midnight Gilt — a tiny heist

An original top-down stealth game for the browser. Wren the thief works
three floors of the Meridian Gallery in one night — the Empress Tiara,
the Tsar's Egg, and the Star of Meridian — under patrolling wardens with
vision cones and sweeping wall cameras ("lantern-eyes"), with an alarm
meter that breathes up while you are seen and drains while you are not.

**Play:** serve `game/` from any static host (or run `node serve.ts`)
and open it in a desktop browser. No build step, no network, no assets —
every picture is drawn and every sound is synthesised by the code.

- **WASD / arrows** move, **Shift** sneaks (slower, smaller profile)
- Deep **carpet** is shadow: you are seen far more slowly on it
- **E** (hold) cracks the prize case; **E** on a vent grate travels it
- **Click** throws a coin ($150 from the take) to pull a guard's eye
- **Q** near a camera spends a spark ($250) to put it to sleep
- **P** pauses, **M** mutes

Grab the headline prize on each floor, pocket side loot on the way, and
reach the green GETAWAY door. Finish with the alarm never past 45 for
the ghost bonus; the clock pays a time bonus too.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json`
- `game/` — the game itself: `index.html`, `style.css`, and ES modules
  under `src/`, one job each (`levels`, `world`, `vision`, `actors`,
  `render`, `input`, `audio`, `shots`, `main`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — frames of the game, posed with `game/src/shots.js`

MIT licensed; see `LICENSE`.
