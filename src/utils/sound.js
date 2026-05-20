// Cinematic Sound Effects Generator using Web Audio API

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("antigravity_muted") === "true";
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem("antigravity_muted", muted ? "true" : "false");
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Play click sound
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Play correct answer chime
  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  // Play wrong answer buzzer
  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.35);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(123, now);
    osc2.frequency.linearRampToValueAtTime(82, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Play whoosh sound for cards sliding in
  playWhoosh() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4; // 0.4s
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(4, now);
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(now + 0.4);
  }

  // Play card flip thud / impact
  playFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.15);
  }

  // Play rumble drone for walkout start (spotlights sweeping)
  playRumble(duration = 2.0) {
    if (this.muted) return null;
    this.init();
    if (!this.ctx) return null;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(55, now); // Low A

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, now);
    filter.frequency.linearRampToValueAtTime(150, now + duration);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + duration);

    return osc; // Return to allow stopping early if needed
  }

  // Play explosive drop (FIFA walkout card drop boom)
  playBoom() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    const oscGain = this.ctx.createGain();
    const merger = this.ctx.createGain();

    // Low frequency boom
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    // Explosive noise
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.6);

    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(oscGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    oscGain.connect(merger);
    noiseGain.connect(merger);
    merger.connect(this.ctx.destination);

    osc.start();
    noise.start();
    osc.stop(now + 0.8);
    noise.stop(now + 0.8);
  }

  // Play victory fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 349.23, 440.00], // D minor
      [349.23, 440.00, 523.25], // F major
      [392.00, 493.88, 587.33, 783.99] // G major & high G
    ];

    chords.forEach((chord, chordIdx) => {
      const timeOffset = chordIdx * 0.25;
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + timeOffset);

        gain.gain.setValueAtTime(0.06, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.5);
      });
    });
  }

  // Play high pitched shimmer for high tier pulls
  playShimmer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 15; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const timeOffset = Math.random() * 1.5;
      const freq = 1200 + Math.random() * 1800; // High frequency sparkle

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + timeOffset);

      gain.gain.setValueAtTime(0.015, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.25);
    }
  }
}

export const sound = new SoundManager();
