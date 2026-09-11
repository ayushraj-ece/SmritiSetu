import React, { useState, useEffect } from 'react';
import { ChevronRight, Heart, Sparkles, Shield, Brain } from 'lucide-react';

interface Props {
  onContinue: () => void;
  onSelectDemo?: () => void;
}

const WELCOME_SCRIPTS = [
  {
    language: 'Assamese (অসমীয়া)',
    text: 'স্মৃতিসেতুলৈ স্বাগতম',
    subtext: 'স্মৃতি আৰু স্বাস্থ্য চৰ্চাৰ এক সহজতম সেতু',
    badge: 'Assam'
  },
  {
    language: 'Meitei / Manipuri (মেইতেই)',
    text: 'স্মৃতিসেতুদা ওকচরি',
    subtext: 'মকোক ফবা অমসুং নুংঙাইবা পুন্সিগীদমক',
    badge: 'Manipur'
  },
  {
    language: 'Mizo',
    text: 'SmritiSetu-ah te lo lawm a che u',
    subtext: 'Mihring thluak hriselna leh hriatreuna',
    badge: 'Mizoram'
  },
  {
    language: 'Bodo (बडो)',
    text: 'स्मृतिसेथुनाव सुबुंफोरखौ गाहामबाय',
    subtext: 'মেগন এবা গোসোনি দৈদেনগিরি',
    badge: 'Bodo Region'
  },
  {
    language: 'Bengali (বাংলা)',
    text: 'স্মৃতিসেতুতে স্বাগতম',
    subtext: 'স্মৃতি সুরক্ষা এবং যত্নশীল সেতু',
    badge: 'Tripura / Assam'
  },
  {
    language: 'English / Nagamese',
    text: 'Welcome to SmritiSetu',
    subtext: 'Bridging Memory, Health & Family Care',
    badge: 'North-East Region'
  }
];

export const MultiScriptWelcome: React.FC<Props> = ({ onContinue, onSelectDemo }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % WELCOME_SCRIPTS.length);
        setFade(true);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const currentScript = WELCOME_SCRIPTS[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B1A14] to-emerald-950 text-white flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden relative font-sans">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Rebranded Badge */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            SmritiSetu <span className="text-emerald-400 text-xs font-semibold">স্মৃতিসেতু</span>
          </span>
        </div>

        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 border border-white/10">
          SIH 2026 PS 26003
        </span>
      </div>

      {/* Center Fading Script Carousel Container */}
      <div className="w-full max-w-md mx-auto py-10 my-auto text-center space-y-7 z-10">
        
        {/* Language Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentScript.language} • {currentScript.badge}</span>
        </div>

        {/* Fading Text Block */}
        <div className={`transition-all duration-300 transform space-y-4 min-h-[140px] flex flex-col items-center justify-center ${
          fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-98'
        }`}>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-md">
            "{currentScript.text}"
          </h1>
          <p className="text-sm sm:text-base text-emerald-200/90 font-medium leading-relaxed max-w-xs">
            {currentScript.subtext}
          </p>
        </div>

        {/* Script Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {WELCOME_SCRIPTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setFade(true);
                }, 200);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex 
                  ? 'w-8 bg-emerald-400 shadow-sm' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Switch to ${WELCOME_SCRIPTS[idx].language}`}
            />
          ))}
        </div>

      </div>

      {/* Bottom CTA Action Bar */}
      <div className="w-full max-w-md mx-auto space-y-3 pb-4 z-10">
        
        <button
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30 transition-all transform active:scale-98 cursor-pointer"
        >
          <span>Get Started with SmritiSetu</span>
          <ChevronRight className="w-5 h-5 text-slate-950" />
        </button>

        {onSelectDemo && (
          <button
            onClick={onSelectDemo}
            className="w-full py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-emerald-300 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Explore Demo Mode (No Login Required)</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium text-center pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Real-Time Online DB
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-400" /> Patient & Caregiver Sync
          </span>
        </div>

      </div>

    </div>
  );
};
