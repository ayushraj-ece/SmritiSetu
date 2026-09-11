import React, { useState } from 'react';
import { Mic, X, Sparkles } from 'lucide-react';
import { voiceService } from '../../../services/voiceService';
import { useLanguage } from '../../../i18n/LanguageContext';

export const VoiceAssistantButton: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const handleToggleVoice = () => {
    if (isListening) {
      voiceService.stopSpeechToText();
      voiceService.stop();
      setIsListening(false);
    } else {
      setIsOpen(true);
      setIsListening(true);
      setTranscript('');
      
      // Speak greeting
      const prompt = language === 'as'
        ? 'মই শুনিলো। আপোনাক কি সহায় কৰিব পাৰোঁ?'
        : 'I am listening. How can I help you today?';
      voiceService.speak(prompt, language);

      voiceService.startSpeechToText(
        (text: string) => {
          setTranscript(text);
        },
        (error: string) => {
          console.warn('Voice error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleClose = () => {
    voiceService.stopSpeechToText();
    voiceService.stop();
    setIsListening(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Center Mic Button in Navigation Bar */}
      <button
        onClick={handleToggleVoice}
        className="w-14 h-14 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-full flex items-center justify-center shadow-lg transform -translate-y-4 border-4 border-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-50"
        title="Talk to MindCare Assistant"
      >
        <Mic className={`w-6 h-6 ${isListening ? 'animate-bounce text-emerald-200' : 'text-white'}`} />
      </button>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-emerald-100 text-center space-y-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-[#1E7F53] rounded-full border-4 border-emerald-100 animate-pulse">
              <Mic className="w-10 h-10 text-[#1E7F53]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#1E7F53] text-xs font-bold rounded-full border border-emerald-100">
                <Sparkles className="w-3.5 h-3.5" /> Voice Support Active
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {language === 'as' ? 'মই শুনিম...' : 'Listening...'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'as'
                  ? 'আপোনাৰ ঔষধ, খেল বা কোনো সহায়ৰ বিষয়ে কওক'
                  : 'Ask about your medicines, games, or daily plan'}
              </p>
            </div>

            {transcript && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 leading-relaxed text-left">
                "{transcript}"
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
