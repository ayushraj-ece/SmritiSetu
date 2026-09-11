/**
 * Real-Time Vocal Tone & Acoustic Stress Monitor Service
 * Uses Web Audio API AnalyserNode to process microphone input,
 * computing calm resonance, acoustic stress, pitch stability, and live waveform buffers.
 */

export interface VocalToneMetrics {
  calmScore: number;       // 0 - 100%
  stressScore: number;     // 0 - 100%
  confidenceScore: number; // 0 - 100%
  pitchHz: number;         // Estimated fundamental frequency
  decibels: number;        // Volume level (dB)
  timestamp: string;
}

type ToneUpdateListener = (metrics: VocalToneMetrics, waveformData: Uint8Array) => void;

class ToneMonitorService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isListening: boolean = false;
  private listeners: Set<ToneUpdateListener> = new Set();

  private pitchHistory: number[] = [];
  private volumeHistory: number[] = [];

  public async startListening(): Promise<boolean> {
    if (this.isListening) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.isListening = true;
      this.pitchHistory = [];
      this.volumeHistory = [];

      this.processAudioLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access for Tone Monitor unavailable:', err);
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }

    this.analyser = null;
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public subscribe(listener: ToneUpdateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private processAudioLoop = () => {
    if (!this.isListening || !this.analyser || !this.audioCtx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Compute volume / RMS
    let sum = 0;
    let maxFreqBin = 0;
    let maxFreqVal = 0;

    for (let i = 0; i < bufferLength; i++) {
      const val = dataArray[i];
      sum += val * val;
      if (val > maxFreqVal) {
        maxFreqVal = val;
        maxFreqBin = i;
      }
    }

    const rms = Math.sqrt(sum / bufferLength);
    const decibels = Math.round(rms);

    // Estimate fundamental pitch from dominant frequency bin
    const sampleRate = this.audioCtx.sampleRate;
    const pitchHz = Math.round((maxFreqBin * sampleRate) / this.analyser.fftSize);

    // Maintain recent history window (last ~30 frames)
    if (rms > 5) {
      this.pitchHistory.push(pitchHz);
      this.volumeHistory.push(rms);
      if (this.pitchHistory.length > 30) this.pitchHistory.shift();
      if (this.volumeHistory.length > 30) this.volumeHistory.shift();
    }

    // Compute variance metrics
    let pitchJitter = 0;
    if (this.pitchHistory.length > 2) {
      const meanPitch = this.pitchHistory.reduce((a, b) => a + b, 0) / this.pitchHistory.length;
      const variance = this.pitchHistory.reduce((a, b) => a + Math.pow(b - meanPitch, 2), 0) / this.pitchHistory.length;
      pitchJitter = Math.sqrt(variance);
    }

    // Calculate Calm Index & Stress Index
    // High jitter or erratic volume spikes increase stress score
    const normalizedJitter = Math.min(pitchJitter / 150, 1.0);
    const stressScore = Math.round(Math.min(100, Math.max(10, normalizedJitter * 85 + (decibels > 120 ? 15 : 0))));
    const calmScore = Math.max(0, 100 - stressScore);
    const confidenceScore = Math.round(Math.min(100, Math.max(30, (rms / 128) * 100)));

    const metrics: VocalToneMetrics = {
      calmScore,
      stressScore,
      confidenceScore,
      pitchHz: rms > 5 ? pitchHz : 0,
      decibels,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Notify active subscribers
    this.listeners.forEach((listener) => listener(metrics, dataArray));

    this.animFrameId = requestAnimationFrame(this.processAudioLoop);
  };
}

export const toneMonitorService = new ToneMonitorService();
