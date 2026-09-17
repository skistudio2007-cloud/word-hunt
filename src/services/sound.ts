/**
 * Audio Synthesizer Engine for WORD HUNT
 * Uses the Web Audio API for zero-latency, realistic, soothing sound effects & ambient music
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private soundGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private soundVolume = 0.8;
  private musicVolume = 0.5;
  private vibrationEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initContext();
        if (this.musicEnabled && !this.isMusicPlaying) {
          this.startAmbientMusic();
        }
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });

      // Cleanly suspend/resume audio when app goes to background or is minimized
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        this.soundGainNode = this.ctx.createGain();
        this.soundGainNode.gain.value = this.soundVolume;
        this.soundGainNode.connect(this.ctx.destination);

        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.value = this.musicVolume;
        this.musicGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(sound: boolean, soundVol: number, music: boolean, musicVol: number, vibration: boolean) {
    this.soundEnabled = sound;
    this.soundVolume = soundVol;
    this.musicEnabled = music;
    this.musicVolume = musicVol;
    this.vibrationEnabled = vibration;

    if (this.soundGainNode && this.ctx) {
      this.soundGainNode.gain.setValueAtTime(this.soundEnabled ? this.soundVolume : 0, this.ctx.currentTime);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicEnabled ? this.musicVolume * 0.35 : 0, this.ctx.currentTime);
    }

    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  public playTap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.soundGainNode);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playLetterSnap(index: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const pentatonicScale = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // G4 to C6
      const noteFreq = pentatonicScale[Math.min(index, pentatonicScale.length - 1)];

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(noteFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.soundGainNode);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  public playWordSuccess() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright cheerful chord)

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.soundGainNode!);

        osc.start(start);
        osc.stop(start + 0.45);
      });

      this.vibrate([20, 30, 40]);
    } catch {}
  }

  public playWordFail() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.soundGainNode);

      osc.start(now);
      osc.stop(now + 0.12);

      this.vibrate(15);
    } catch {}
  }

  public playStarPop(index: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const notes = [659.25, 783.99, 1046.50]; // E5, G5, C6
      const freq = notes[Math.min(index, notes.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.soundGainNode);

      osc.start(now);
      osc.stop(now + 0.18);

      this.vibrate(25);
    } catch {}
  }

  public playLevelVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0 },    // C5
        { f: 659.25, t: 0.12 }, // E5
        { f: 783.99, t: 0.24 }, // G5
        { f: 1046.50, t: 0.36 }, // C6
        { f: 880.00, t: 0.48 }, // A5
        { f: 1046.50, t: 0.60 }, // C6 (sustained)
      ];

      melody.forEach(item => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        const start = now + item.t;
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

        osc.connect(gain);
        gain.connect(this.soundGainNode!);

        osc.start(start);
        osc.stop(start + 0.5);
      });

      this.vibrate([40, 50, 40, 50, 80]);
    } catch {}
  }

  public playHintSparkle() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.soundGainNode) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.06;
        osc.frequency.setValueAtTime(800 + i * 260, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(this.soundGainNode);
        osc.start(start);
        osc.stop(start + 0.18);
      }
    } catch {}
  }

  public startAmbientMusic() {
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;

    // Lightweight, relaxing 4-chord ambient progression (Cmaj7 -> Am7 -> Fmaj7 -> G6)
    const ambientProgression = [
      { bass: 65.41, notes: [261.63, 329.63, 392.00], chime: 523.25 }, // C2, C4, E4, G4, C5
      { bass: 55.00, notes: [220.00, 261.63, 329.63], chime: 440.00 }, // A1, A3, C4, E4, A4
      { bass: 43.65, notes: [174.61, 220.00, 261.63], chime: 349.23 }, // F1, F3, A3, C4, F4
      { bass: 49.00, notes: [196.00, 246.94, 293.66], chime: 392.00 }, // G1, G3, B3, D4, G4
    ];

    let chordIdx = 0;
    const STEP_DURATION = 6.0; // seconds per chord

    const playChordStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode || !this.musicEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const currentChord = ambientProgression[chordIdx % ambientProgression.length];
        chordIdx++;

        // 1. Warm Gentle Sub Bass (Sine)
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(currentChord.bass, now);
        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
        bassGain.gain.linearRampToValueAtTime(0.001, now + STEP_DURATION);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGainNode);
        bassOsc.start(now);
        bassOsc.stop(now + STEP_DURATION);

        // 2. Soft Ambient Pad with Single Shared Filter
        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(550, now);

        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.001, now);
        padGain.gain.linearRampToValueAtTime(0.035, now + 1.8);
        padGain.gain.linearRampToValueAtTime(0.001, now + STEP_DURATION);
        padFilter.connect(padGain);
        padGain.connect(this.musicGainNode);

        currentChord.notes.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(padFilter);
          osc.start(now);
          osc.stop(now + STEP_DURATION);
        });

        // 3. One Soft Melodic Chime (after 1.8s)
        const chimeTime = now + 1.8;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(currentChord.chime, chimeTime);

        chimeGain.gain.setValueAtTime(0.001, chimeTime);
        chimeGain.gain.linearRampToValueAtTime(0.03, chimeTime + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.6);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.musicGainNode);
        chimeOsc.start(chimeTime);
        chimeOsc.stop(chimeTime + 1.7);
      } catch {}
    };

    playChordStep();
    this.musicInterval = window.setInterval(playChordStep, STEP_DURATION * 1000);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, this.ctx.currentTime);
      this.musicGainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    }
  }

  private vibrate(pattern: number | number[]) {
    if (!this.vibrationEnabled || typeof window === 'undefined' || !window.navigator?.vibrate) return;
    try {
      window.navigator.vibrate(pattern);
    } catch {}
  }
}

export const soundManager = new SoundEngine();
