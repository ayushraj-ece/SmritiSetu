import React, { useState } from 'react';
import { Volume2, Mic, Settings, Check, Sparkles } from 'lucide-react';
import { elevenLabsService, ELEVENLABS_VOICE_PRESETS } from '../../services/elevenLabsService';
import { voiceService } from '../../services/voiceService';

interface Props {
  onSpeechInput?: (text: string) => void;
  compact?: boolean;
}

export const VoiceControlBar: React.FC<Props> = ({ onSpeechInput, compact = false }) => {
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(elevenLabsService.getApiKey());
  const [selectedVoice, setSelectedVoice] = useState<string>(elevenLabsService.getSelectedVoiceId());
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string>('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string>('');

  const isConfigured = elevenLabsService.isConfigured();

  const handleSaveApiKey = () => {
    elevenLabsService.setApiKey(apiKeyInput);
    setSavedSuccessMsg('ElevenLabs API Key configured successfully!');
    setTimeout(() => {
      setSavedSuccessMsg('');
      setShowConfigModal(false);
    }, 1500);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    elevenLabsService.setVoiceId(voiceId);
    voiceService.speak('SmritiSetu voice engine updated successfully.');
  };

  const handleToggleSTT = () => {
    if (isListening) {
      voiceService.stopSpeechToText();
      setIsListening(false);
    } else {
      setTranscriptPreview('Listening...');
      setIsListening(true);
      const success = voiceService.startSpeechToText(
        (text) => {
          setTranscriptPreview(text);
          if (onSpeechInput) onSpeechInput(text);
        },
        (err) => {
          setTranscriptPreview(`Error: ${err}`);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (!success) {
        setIsListening(false);
        setTranscriptPreview('Browser speech recognition unavailable.');
      }
    }
  };

  return (
    <div className={`bg-white border border-[#E2E8F0] ${compact ? 'p-3' : 'p-4'} rounded-2xl flex flex-wrap items-center justify-between gap-3 font-sans shadow-xs`}>
      {/* Voice Status & Preset Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#0284C7]" />
          <span className="text-xs font-bold text-[#0F172A]">Voice AI Engine:</span>
        </div>

        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0F172A] outline-none cursor-pointer"
        >
          {ELEVENLABS_VOICE_PRESETS.map((v) => (
            <option key={v.voice_id} value={v.voice_id}>
              {v.name}
            </option>
          ))}
        </select>

        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
          isConfigured 
            ? 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]' 
            : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
        }`}>
          {isConfigured ? '⚡ ElevenLabs HD Active' : '🌐 Web Speech Fallback'}
        </span>
      </div>

      {/* Mic Input & Settings Button */}
      <div className="flex items-center gap-2 flex-wrap">
        {transcriptPreview && (
          <span className="text-xs text-[#64748B] max-w-[200px] truncate bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
            "{transcriptPreview}"
          </span>
        )}

        <button
          onClick={handleToggleSTT}
          className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            isListening 
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>{isListening ? 'Listening...' : 'Voice Mic Input'}</span>
        </button>

        <button
          onClick={() => setShowConfigModal(true)}
          className="p-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-xl transition-all cursor-pointer"
          title="Configure ElevenLabs Voice Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl max-w-md w-full space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-xl font-extrabold text-[#0F172A]">ElevenLabs Voice AI Setup</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Enter your ElevenLabs API Key to enable ultra-clear, natural, compassionate voice synthesis for dementia care activities and family stories.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0F172A]">ElevenLabs API Key (`xi-api-key`)</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk_..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 text-xs font-mono text-[#0F172A] rounded-xl outline-none focus:border-[#0284C7]"
              />
            </div>

            {savedSuccessMsg && (
              <div className="p-2.5 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0284C7]" />
                <span>{savedSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Voice Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
