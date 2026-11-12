/**
 * THOR: GOD OF THUNDER - Procedural Web Audio Synthesizer
 * Zero external audio files, 100% procedurally synthesized sound effects and Nordic ambient music.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private flightWindGain: GainNode | null = null;
  private flightFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.initFlightWindLoop();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  /**
   * Continuous wind roar during flight, frequency controlled by Thor's speed
   */
  private initFlightWindLoop() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      // 2 seconds of pink/white noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.15;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.flightFilter = this.ctx.createBiquadFilter();
      this.flightFilter.type = 'lowpass';
      this.flightFilter.frequency.value = 200;

      this.flightWindGain = this.ctx.createGain();
      this.flightWindGain.gain.value = 0.0;

      whiteNoise.connect(this.flightFilter);
      this.flightFilter.connect(this.flightWindGain);
      this.flightWindGain.connect(this.sfxGain);

      whiteNoise.start(0);
    } catch {
      // Ignore
    }
  }

  public updateFlightWind(isFlying: boolean, speedNorm: number) {
    if (!this.ctx || !this.flightWindGain || !this.flightFilter) return;
    const t = this.ctx.currentTime;
    if (isFlying) {
      const targetGain = 0.05 + speedNorm * 0.25;
      const targetFreq = 300 + speedNorm * 1200;
      this.flightWindGain.gain.setTargetAtTime(targetGain, t, 0.1);
      this.flightFilter.frequency.setTargetAtTime(targetFreq, t, 0.1);
    } else {
      this.flightWindGain.gain.setTargetAtTime(0, t, 0.2);
    }
  }

  /**
   * Sound: Lightning Strike (Explosive thunderclap + high electric crackle)
   */
  public playLightningStrike() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // 1. Initial Sharp Crack (High frequency burst)
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(1400, t);
    crackOsc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    crackGain.gain.setValueAtTime(0.5, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    crackOsc.connect(crackGain);
    crackGain.connect(this.sfxGain);
    crackOsc.start(t);
    crackOsc.stop(t + 0.15);

    // 2. Heavy Sub Bass Rumble (Thunder)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, t + 0.03);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.8);
    subGain.gain.setValueAtTime(0.9, t + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t + 0.03);
    subOsc.stop(t + 1.2);
  }

  /**
   * Sound: Thunder Wave / Ground Slam (Expanding electrical shockwave)
   */
  public playThunderWave() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.5);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /**
   * Sound: Mjölnir Light Swing
   */
  public playMjolnirSwing() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.22);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Sound: Heavy Hammer Hit (Impact + metallic resonance + electrical spark)
   */
  public playHammerHit() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Metallic clank (high bell-like tone)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'square';
    bellOsc.frequency.setValueAtTime(680, t);
    bellGain.gain.setValueAtTime(0.4, t);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    bellOsc.connect(bellGain);
    bellGain.connect(this.sfxGain);
    bellOsc.start(t);
    bellOsc.stop(t + 0.35);

    // Punchy thud
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'sine';
    punchOsc.frequency.setValueAtTime(160, t);
    punchOsc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    punchGain.gain.setValueAtTime(0.7, t);
    punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    punchOsc.connect(punchGain);
    punchGain.connect(this.sfxGain);
    punchOsc.start(t);
    punchOsc.stop(t + 0.2);
  }

  /**
   * Sound: Mjölnir Throw
   */
  public playMjolnirThrow() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.45);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  /**
   * Sound: Mjölnir Return & Catch
   */
  public playMjolnirCatch() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Fast magnetic snap into palm
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Sound: Lightning Dash / Teleport
   */
  public playDash() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Sound: God Mode Activation
   */
  public playGodMode() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const notes = [220, 277.18, 329.63, 440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.2, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + 1.2);
    });
  }

  /**
   * Sound: Jump / Takeoff
   */
  public playJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Sound: Level Up / Victory fanfare
   */
  public playFanfare() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const chords = [261.63, 329.63, 392.0, 523.25]; // C Major arpeggio
    chords.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.3, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.1);
      osc.stop(t + 1.5);
    });
  }

  /**
   * UI Click
   */
  public playUiClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Ambient Nordic heroic music drone (Low D-minor orchestral synth)
   */
  public startMusic() {
    if (this.musicInterval || !this.ctx || !this.musicGain) return;
    this.resume();

    // D-minor Norse motif frequencies: D2, A2, D3, F3, G3, A3
    const chordProgression = [
      [73.42, 110.0, 146.83, 174.61], // Dm
      [65.41, 98.0, 130.81, 164.81],  // C
      [58.27, 87.31, 116.54, 146.83], // Bb
      [73.42, 110.0, 146.83, 220.0],  // Dm9
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      const chord = chordProgression[chordIdx % chordProgression.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        // Slow cinematic swelling envelope
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12 / (i + 1), t + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 4.8);

        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(t);
        osc.stop(t + 5.0);
      });
    };

    playNextChord();
    this.musicInterval = setInterval(playNextChord, 4500);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundManager();
