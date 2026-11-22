// Midnight Gilt — the three floors of the Meridian Gallery.
//
// Each floor is drawn as text so the plan of the job reads at a glance:
//   #  wall            .  marble floor        ,  deep carpet (shadow)
//   B  display case / pillar (blocks feet and sight alike)
//   D  doorway         V  vent grate (E pops you to the matching grate)
//   E  getaway door    T  where Wren slips in
//   *  the headline prize in its case (hold E to crack it)
//   g  goblet $300     p  painting $550       j  jewel $850
// Guards walk the waypoint loops listed under the map; cameras sit on
// their tile and sweep around their heading. Two floors share no plan:
// every floor has at least two ways to the prize and two ways back.

export const LOOT_VALUES = { g: 300, p: 550, j: 850 };

export const FLOORS = [
  {
    name: 'Floor One — The Gallery of Hours',
    prize: 'The Empress Tiara',
    prizeValue: 1500,
    parSeconds: 95,
    tools: { coins: 3, sparks: 2 },
    map: [
      '################################',
      '#..p..,,,.........#...#,,,,,,,*#',
      '#......,,,........#...#,,,,,,,,#',
      '#..........##D#####...D,,,,,,,,#',
      '#..........#......#...#,,,,,,,,#',
      '#..BB......#......#...####D#####',
      '#..BB......D......D......g.....#',
      '#......,,,,,,,,,,,,......BB....#',
      '#......,,,,,,,,,,,,............#',
      '#..j.......##D########D###.....#',
      '#..........#......#......#..p..#',
      '#....BB....#......#......#.....#',
      '#....BB....D..g...D..BB..###D###',
      '#..........#......#..BB........#',
      '#..V.......#......#......V.....#',
      '#..........####D###............#',
      '#.T.E..........................#',
      '################################',
    ],
    guards: [
      { path: [[6, 2], [13, 2], [13, 7], [6, 7]] },
      { path: [[24, 14], [29, 14], [29, 16], [19, 16]] },
    ],
    cameras: [
      { at: [18, 1], heading: 0.85, phase: 0 },
    ],
  },
  {
    name: 'Floor Two — The Counting House',
    prize: "The Tsar's Egg",
    prizeValue: 2200,
    parSeconds: 120,
    tools: { coins: 3, sparks: 2 },
    map: [
      '################################',
      '#......#......,,,,,,#......,,,*#',
      '#..g...#......,,,,,,D......,,,,#',
      '#......D......,,,,,,#......,,,,#',
      '####D####..####D#####..####D####',
      '#..........#........#..........#',
      '#..BB..V...#...BB...#...V..BB..#',
      '#..BB......D...BB...D......BB..#',
      '#......,,,,,,,,,,,,,,,,........#',
      '#......,,,,,,,,,,,,,,,,....j...#',
      '####D#####D########D#####D######',
      '#....#......#......#......#....#',
      '#.p..D..BB..D..g...D..BB..D....#',
      '#....#..BB..#......#..BB..#..g.#',
      '#....#......#......#......#....#',
      '#.T..####D####..####D####...E..#',
      '#..............................#',
      '################################',
    ],
    guards: [
      { path: [[2, 5], [9, 5], [9, 8], [16, 8], [16, 9], [2, 9]] },
      { path: [[9, 1], [18, 1], [18, 3], [9, 3]] },
      { path: [[21, 11], [25, 11], [25, 14], [21, 14]] },
    ],
    cameras: [
      { at: [7, 1], heading: 0.7, phase: 0 },
      { at: [26, 11], heading: 2.4, phase: 2.1 },
    ],
  },
  {
    name: 'Floor Three — The Star Vault',
    prize: 'The Star of Meridian',
    prizeValue: 3500,
    parSeconds: 150,
    tools: { coins: 4, sparks: 3 },
    map: [
      '################################',
      '#...#........,,,,,,,,......#...#',
      '#.g.#........,,,,,,,,......#.j.#',
      '#...D....##D########D##....D...#',
      '#...#....#,,,,,,,,,,,,#....#...#',
      '##D##....#,,,,,,*,,,,,#....##D##',
      '#........#,,,,,,,,,,,,#........#',
      '#..BB....####D####D####....BB..#',
      '#..BB.......V......V.......BB..#',
      '#......,,,,,,,,,,,,,,,,........#',
      '#..p...,,,,,,,,,,,,,,,,....g...#',
      '####D########D####D########D####',
      '#......#......#......#......#..#',
      '#..BB..D..BB..D..BB..D..BB..D..#',
      '#..BB..#..BB..#..BB..#..BB..#..#',
      '#......#......#......#......#..#',
      '#.T....####D#################E.#',
      '################################',
    ],
    guards: [
      { path: [[6, 8], [6, 10], [25, 10], [25, 8]] },
      { path: [[13, 1], [18, 1], [18, 2], [13, 2]] },
      { path: [[2, 12], [5, 12], [5, 15], [2, 15]] },
      { path: [[23, 12], [27, 12], [27, 15], [23, 15]] },
    ],
    cameras: [
      { at: [10, 3], heading: 1.5, phase: 0 },
      { at: [21, 3], heading: 1.65, phase: 3.0 },
      { at: [16, 11], heading: -1.5, phase: 1.2 },
    ],
  },
];
