// Midnight Gilt — keyboard and mouse, read as state the loop polls.
// Keys are tracked held (for movement) and pressed (one-frame edges,
// for actions); mouse clicks arrive in canvas pixels, scaled from the
// element's box so a thrown coin lands where the player pointed.

export function createInput(canvas) {
  const held = new Set();
  const edges = new Set();
  const mouse = { x: 0, y: 0, inside: false };
  let clickAt = null;

  const toCanvas = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) edges.add(event.code);
    held.add(event.code);
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('mousemove', (event) => {
    const p = toCanvas(event);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.inside = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.inside = false; });
  canvas.addEventListener('mousedown', (event) => {
    clickAt = toCanvas(event);
  });

  return {
    mouse,
    down: (code) => held.has(code),
    pressed: (code) => edges.has(code),
    takeClick() {
      const c = clickAt;
      clickAt = null;
      return c;
    },
    // Called once at the end of each frame so an edge is seen once.
    endFrame() {
      edges.clear();
    },
    movement() {
      let x = 0;
      let y = 0;
      if (this.down('KeyA') || this.down('ArrowLeft')) x -= 1;
      if (this.down('KeyD') || this.down('ArrowRight')) x += 1;
      if (this.down('KeyW') || this.down('ArrowUp')) y -= 1;
      if (this.down('KeyS') || this.down('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
  };
}
