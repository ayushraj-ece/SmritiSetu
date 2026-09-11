import React, { useEffect, useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 600); // Trigger transition after fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white flex flex-col items-center justify-center p-6 transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-6 animate-in zoom-in-90 duration-700">
        
        {/* Animated Brand Logo Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-2xl flex items-center justify-center relative">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Brain className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
            স্মৃতিসেতু
          </h1>
          <p className="text-lg font-bold text-emerald-400 tracking-wider">
            SMRITISETU
          </p>
          <p className="text-xs text-slate-400 font-medium pt-1 max-w-xs mx-auto">
            Bridging Memory & Compassionate Care
          </p>
        </div>

        {/* Loading Spinner Indicator */}
        <div className="pt-8 flex items-center justify-center gap-2 text-xs text-emerald-300/80 font-semibold">
          <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Initializing Real-Time Platform...</span>
        </div>

      </div>
    </div>
  );
};
