// Midnight Gilt — a pocket sound bank: every effect is a small
// oscillator phrase through one gain, so the game carries its own
// sounds as code and needs no audio files. The context stays locked
// until the player's first key or click, as browsers require.

export function createSoundBank() {
  let ctx = null;
  let master = null;
  let muted = false;

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  }

  function tone(freq, at, dur, type = 'sine', vol = 1, slideTo = null) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() { return muted; },
    step(sneaking) { tone(sneaking ? 190 : 150, 0, 0.05, 'triangle', 0.12); },
    coin() { tone(1560, 0, 0.09, 'square', 0.25); tone(2090, 0.07, 0.14, 'square', 0.2); },
    pickup() { tone(880, 0, 0.08, 'triangle', 0.5); tone(1320, 0.06, 0.12, 'triangle', 0.45); },
    crackTick() { tone(2400, 0, 0.03, 'square', 0.12); },
    cracked() { tone(660, 0, 0.1, 'triangle', 0.5); tone(990, 0.08, 0.16, 'triangle', 0.5); },
    spark() { tone(300, 0, 0.22, 'sawtooth', 0.3, 60); },
    vent() { tone(320, 0, 0.16, 'sine', 0.4, 90); },
    suspicion() { tone(1180, 0, 0.07, 'sine', 0.22); },
    alarmBell() { tone(740, 0, 0.16, 'square', 0.4); tone(740, 0.2, 0.16, 'square', 0.4); },
    busted() { tone(392, 0, 0.22, 'sawtooth', 0.4); tone(311, 0.2, 0.26, 'sawtooth', 0.4); tone(233, 0.42, 0.5, 'sawtooth', 0.45); },
    getaway() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.24, 'triangle', 0.5)); },
  };
}
