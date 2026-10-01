// Ambient sound generator using Web Audio API (Zero external assets required)
class SanctuaryAudio {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public playGentleKeypress() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(240 + Math.random() * 40, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  public playEnterChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;
      [329.63, 493.88, 659.25].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.0001, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.03, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.3);
      });
    } catch {
      // Ignore audio failure
    }
  }

  public toggleAmbient(enable: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

      if (!enable) {
        if (this.gainNode) {
          this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
        }
        this.isPlaying = false;
        return;
      }

      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      if (!this.noiseNode) {
        // Pink noise buffer for ambient rain/tape hiss
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        whiteNoise.start(0);
        this.noiseNode = whiteNoise;
      } else if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.015, this.ctx.currentTime, 0.4);
      }
      this.isPlaying = true;
    } catch {
      // Audio not supported or blocked
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const sanctuaryAudio = new SanctuaryAudio();
