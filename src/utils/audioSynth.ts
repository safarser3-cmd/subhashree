/**
 * Renaissance Lute & Acoustic Ambient Synthesizer
 * Uses Web Audio API to generate delicate, peaceful modal arpeggios (Dorian / Aolian Renaissance chords)
 * completely local, zero latency, volume controlled.
 */

class LuteSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;

  // Renaissance scale frequencies (A minor / D dorian harmonic lute frequencies)
  private readonly chordProgressions: number[][] = [
    // Am (A3, C4, E4, A4, B4, C5)
    [220.0, 261.63, 329.63, 440.0, 493.88, 523.25],
    // Dm (D3, F3, A3, D4, F4, A4)
    [146.83, 174.61, 220.0, 293.66, 349.23, 440.0],
    // G (G3, B3, D4, G4, B4, D5)
    [196.0, 246.94, 293.66, 392.0, 493.88, 587.33],
    // C (C3, E3, G3, C4, E4, G4)
    [130.81, 164.81, 196.0, 261.63, 329.63, 392.0],
    // F (F3, A3, C4, F4, A4, C5)
    [174.61, 220.0, 261.63, 349.23, 440.0, 523.25],
    // E (E3, G#3, B3, E4, B4, E5)
    [164.81, 207.65, 246.94, 329.63, 493.88, 659.25]
  ];

  private currentProgressionIndex: number = 0;
  private currentNoteIndex: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private pluckLuteString(frequency: number, delayMs: number = 0) {
    if (!this.ctx || !this.gainNode) return;

    setTimeout(() => {
      if (!this.ctx || !this.isPlaying || !this.gainNode) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Triangle oscillator gives warm string timbre
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);

      // Low pass filter mimics wooden body of Renaissance Lute
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 1.6);

      // Pluck envelope: sharp attack, gentle harmonic decay
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 2.5);
    }, delayMs);
  }

  private stepArpeggio = () => {
    if (!this.isPlaying) return;

    const currentChord = this.chordProgressions[this.currentProgressionIndex];
    const freq = currentChord[this.currentNoteIndex];

    this.pluckLuteString(freq, 0);

    // Occasional sub-bass harp drone note
    if (this.currentNoteIndex === 0 && Math.random() > 0.4) {
      this.pluckLuteString(currentChord[0] / 2, 50);
    }

    this.currentNoteIndex++;
    if (this.currentNoteIndex >= currentChord.length) {
      this.currentNoteIndex = 0;
      this.currentProgressionIndex = (this.currentProgressionIndex + 1) % this.chordProgressions.length;
    }

    // Organic timing variation (like a living lutenist in Florence)
    const nextInterval = 420 + Math.floor(Math.random() * 180);
    this.timerId = window.setTimeout(this.stepArpeggio, nextInterval);
  };

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.stepArpeggio();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getActiveState(): boolean {
    return this.isPlaying;
  }
}

export const ambientLute = new LuteSynthesizer();
