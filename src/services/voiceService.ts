import type { Language } from '../types';
import { elevenLabsService } from './elevenLabsService';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Speak text with high-definition ElevenLabs API if available, 
   * falling back seamlessly to Web Speech API.
   */
  public async speak(
    text: string, 
    lang: Language = 'en', 
    onEnd?: () => void
  ): Promise<void> {
    this.stop();

    // Attempt ElevenLabs TTS synthesis first if API key is active
    if (elevenLabsService.isConfigured()) {
      const handled = await elevenLabsService.speakText(
        text,
        undefined,
        () => { this.isSpeaking = true; },
        () => {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        }
      );

      if (handled) return;
    }

    // Fallback to browser Web Speech API
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice language code
    const langMap: Record<string, string> = {
      en: 'en-IN',
      as: 'bn-IN',
      bn: 'bn-IN',
      brx: 'hi-IN',
      mni: 'hi-IN',
      kha: 'en-IN',
      lus: 'en-IN',
      ne: 'ne-NP',
      trp: 'hi-IN'
    };

    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.85; // Calm cadence for elderly users
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  public stop(): void {
    elevenLabsService.stopAudio();
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Listen for speech input via Web Speech Recognition API
   */
  public startSpeechToText(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void,
    onEnd?: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech Recognition is not supported in this browser.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      if (onError) onError(err.message || 'Speech recognition failed');
      return false;
    }
  }

  public stopSpeechToText(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignored
      }
      this.recognition = null;
    }
  }
}

export const voiceService = new VoiceService();
