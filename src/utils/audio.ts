/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Procedural Synthesizer for MindSpace Sensory Mechanics
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientNoiseNode: BiquadFilterNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play satisfying crisp click/pop sound for bubble wrap
  playPop(pitchModifier = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Quick pitch drop creates a popping effect
      const startFreq = 400 * pitchModifier;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80 * pitchModifier, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      // Lowpass filter to make it cozy and moist, not harsh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Sound failed to play:", e);
    }
  }

  // Play squelch/squish sound for Slime simulation
  playSlimeSplat(intensity = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const noise = this.ctx.createOscillator(); // Or filtered buffer
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150 + Math.random() * 50, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

      // Add a rapid low-frequency modulation for squishiness
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      modulator.type = 'sine';
      modulator.frequency.value = 35; // 35Hz
      modGain.gain.value = 40;

      modulator.connect(modGain);
      modGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.08 * intensity, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      modulator.start();
      osc.start();

      modulator.stop(this.ctx.currentTime + 0.25);
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Sound failed to play:", e);
    }
  }

  // Play sandy rake sounds (filtered white noise burst)
  playRakeScratch(duration = 0.15, force = 0.5) {
    try {
      this.init();
      if (!this.ctx) return;

      // Generate a tiny white noise buffer or use a fast oscillator network
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      // Low sand-like resonance
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02 * force, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start();
    } catch (e) {
      console.warn("Sound failed to play:", e);
    }
  }

  // Play satisfying rock-stacked sound
  playPebbleStack(pitch = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * pitch, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110 * pitch, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      console.warn("Sound failed to play:", e);
    }
  }

  // Ambient Nature sound (synthesized waves)
  toggleAmbient(state?: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

      const targetState = state !== undefined ? state : !this.isAmbientPlaying;
      if (targetState === this.isAmbientPlaying) return;

      if (targetState) {
        // Start Wave sound synthesis
        const bufferSize = this.ctx.sampleRate * 4; // 4 seconds loop
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        // Create brownian-like noise for deep water rumble
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Amplify
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        // Constant wave amplitude modulation using an LFO
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 12 seconds per wave
        lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        // Fade in
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 2.0);

        lfo.start();
        source.start();

        this.ambientNoiseNode = filter;
        this.ambientGain = gain;
        this.isAmbientPlaying = true;
        
        // Save source & lfo to stop them later
        (this as any)._waveSource = source;
        (this as any)._waveLfo = lfo;

      } else {
        // Stop Wave sound synthesis
        if (this.ambientGain && this.ctx) {
          const gain = this.ambientGain;
          const source = (this as any)._waveSource;
          const lfo = (this as any)._waveLfo;

          gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
          setTimeout(() => {
            try {
              if (source) source.stop();
              if (lfo) lfo.stop();
            } catch (err) {}
          }, 1100);
        }
        this.isAmbientPlaying = false;
      }
    } catch (e) {
      console.warn("Ambient sound failed:", e);
    }
  }

  getAmbientPlaying() {
    return this.isAmbientPlaying;
  }
}

export const audio = new SoundEngine();
