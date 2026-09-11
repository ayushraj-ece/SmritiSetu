// Web Audio API Synthesizer for Offline Alarm Chimes (Zero External Dependencies)

class AlarmAudioService {
  private audioCtx: AudioContext | null = null;

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Play a crisp, pleasant medical alarm chime (3-tone sequence)
   */
  public playChimeSequence(): void {
    try {
      const ctx = this.initAudioContext();
      const now = ctx.currentTime;

      // Frequencies for a pleasant medical alarm (E5, G#5, B5)
      const frequencies = [659.25, 830.61, 987.77, 1318.51];
      
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.18);

        // Envelope
        gain.gain.setValueAtTime(0, now + index * 0.18);
        gain.gain.linearRampToValueAtTime(0.3, now + index * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.18 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.18);
        osc.stop(now + index * 0.18 + 0.5);
      });
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Play a persistent alarm ring pattern
   */
  public playAlarmRing(durationSeconds: number = 3): void {
    let elapsed = 0;
    const interval = setInterval(() => {
      this.playChimeSequence();
      elapsed += 0.8;
      if (elapsed >= durationSeconds) {
        clearInterval(interval);
      }
    }, 800);
  }
}

export const alarmAudioService = new AlarmAudioService();
