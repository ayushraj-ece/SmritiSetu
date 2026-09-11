import React, { useState, useEffect } from 'react';
import { BrandMark } from './BrandMark';
import { MultilingualWordmark } from './MultilingualWordmark';

interface Props {
  onFinish?: () => void;
}

export const IdentityLoader: React.FC<Props> = ({ onFinish }) => {
  const [showLoader, setShowLoader] = useState<boolean>(() => {
    // Play once per browser session
    const played = sessionStorage.getItem('smritisetu_intro_played');
    return !played;
  });

  const [fadeContainer, setFadeContainer] = useState<boolean>(false);

  useEffect(() => {
    if (!showLoader) {
      if (onFinish) onFinish();
      return;
    }
  }, [showLoader, onFinish]);

  const handleSequenceComplete = () => {
    sessionStorage.setItem('smritisetu_intro_played', 'true');
    setFadeContainer(true);
    setTimeout(() => {
      setShowLoader(false);
      if (onFinish) onFinish();
    }, 700);
  };

  if (!showLoader) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#FAF8F5] text-[#1C1F24] flex flex-col items-center justify-center p-6 transition-opacity duration-700 ${
        fadeContainer ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full text-center space-y-8 my-auto">
        {/* Institutional Emblem */}
        <div className="w-16 h-16 mx-auto bg-[#FAF7F0] border-2 border-[#C5A059] flex items-center justify-center shadow-xs">
          <BrandMark size={40} />
        </div>

        {/* Multilingual Sequence */}
        <MultilingualWordmark onComplete={handleSequenceComplete} />

        {/* Thin Gold Divider */}
        <div className="w-24 h-[1px] bg-[#C5A059]/60 mx-auto" />

        {/* Supporting Institutional Footer */}
        <div className="space-y-1">
          <p className="font-serif text-sm text-[#1C1F24] font-bold">
            Bridging Memory & Care
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#7E786D]">
            Ministry of Development of North Eastern Region (MDoNER)
          </p>
        </div>
      </div>
    </div>
  );
};
