/**
 * ElevenLabs Voice API Service
 * High-definition text-to-speech synthesis and speech recognition for SmritiSetu
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

// Recommended calm, compassionate voice presets for elder dementia care
export const ELEVENLABS_VOICE_PRESETS: ElevenLabsVoice[] = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel
    name: 'Rachel (Warm & Calm)',
    category: 'Compassionate Care',
    description: 'Soft, reassuring, clear feminine cadence ideal for elderly reassurance.'
  },
  {
    voice_id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    name: 'Domi (Gentle & Steady)',
    category: 'Gentle Guide',
    description: 'Calm, articulated pacing suited for memory recall instructions.'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    name: 'Bella (Warm Institutional)',
    category: 'Regional Assist',
    description: 'Polished Indian/Global accent with clear pronunciation.'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV', // Antoni
    name: 'Antoni (Dignified Male)',
    category: 'Calm Companion',
    description: 'Deep, serene masculine voice for structured guidance.'
  }
];

class ElevenLabsService {
  private apiKey: string = '';
  private currentAudio: HTMLAudioElement | null = null;
  private selectedVoiceId: string = ELEVENLABS_VOICE_PRESETS[0].voice_id;

  constructor() {
    // Load default API key from environment variable if present
    const envKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envKey && typeof envKey === 'string') {
      this.apiKey = envKey;
    } else {
      // Check localStorage for saved key
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('smritisetu_elevenlabs_key');
        if (saved) this.apiKey = saved;
      }
    }
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('smritisetu_elevenlabs_key', this.apiKey);
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setVoiceId(voiceId: string): void {
    this.selectedVoiceId = voiceId;
  }

  public getSelectedVoiceId(): string {
    return this.selectedVoiceId;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Synthesize text to speech via ElevenLabs API
   */
  public async speakText(
    text: string, 
    voiceId?: string, 
    onStart?: () => void, 
    onEnd?: () => void
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      return false; // Signal fallback to browser Web Speech API
    }

    this.stopAudio();

    const targetVoice = voiceId || this.selectedVoiceId;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoice}`;

    try {
      if (onStart) onStart();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.85,       // High stability for consistent, non-startling audio
            similarity_boost: 0.75, // Natural voice clarity
            style: 0.1,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        console.warn('ElevenLabs API request failed with status:', response.status);
        if (onEnd) onEnd();
        return false;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn('ElevenLabs audio playback error:', err);
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('ElevenLabs TTS error:', err);
      if (onEnd) onEnd();
      return false;
    }
  }

  public stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
