import React, { useState, useEffect } from 'react';

interface LangSlide {
  text: string;
  langLabel: string;
  scriptInfo: string;
}

const NORTHEAST_LANGUAGES: LangSlide[] = [
  { text: "स्मृतिसेतु", langLabel: "Devanagari Primary", scriptInfo: "Hindi / Bodo / Nepali" },
  { text: "স্মৃতিসেতু", langLabel: "অসমীয়া", scriptInfo: "Assamese Script Context" },
  { text: "স্মৃতিসেতু", langLabel: "বাংলা", scriptInfo: "Bengali Script Context" },
  { text: "SMRITISETU", langLabel: "Khasi • Mizo • Kokborok", scriptInfo: "Roman Script Context" },
  { text: "स्मৃতিসেতু", langLabel: "स्मृतिसेतु Platform", scriptInfo: "Bridging Memory & Care" }
];

interface Props {
  onComplete?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export const MultilingualWordmark: React.FC<Props> = ({
  onComplete,
  className = '',
  autoPlay = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setCurrentIndex(NORTHEAST_LANGUAGES.length - 1);
      if (onComplete) onComplete();
      return;
    }

    if (!autoPlay) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let stepIndex = 0;

    const runSequence = () => {
      if (stepIndex >= NORTHEAST_LANGUAGES.length - 1) {
        if (onComplete) onComplete();
        return;
      }

      // Step 1: Hold current slide (1000ms)
      timeoutId = setTimeout(() => {
        // Step 2: Fade Out (600ms)
        setOpacity(0);

        timeoutId = setTimeout(() => {
          stepIndex++;
          setCurrentIndex(stepIndex);
          // Step 3: Fade In (600ms)
          setOpacity(1);

          // Loop until final slide
          runSequence();
        }, 600);
      }, 1100);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, [autoPlay, onComplete]);

  const currentSlide = NORTHEAST_LANGUAGES[currentIndex];

  if (prefersReducedMotion) {
    return (
      <div className={`text-center space-y-1 ${className}`}>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1C1F24]">
          स्मृतिसेतु
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#7A612D]">
          SMRITISETU • Bridging Memory & Care
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center space-y-2 select-none ${className}`}>
      <div
        className="transition-opacity duration-600 ease-in-out"
        style={{ opacity }}
      >
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1F24]">
          {currentSlide.text}
        </h1>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#7A612D] font-bold">
            {currentSlide.langLabel}
          </span>
          <span className="text-[#C5A059]">•</span>
          <span className="font-sans text-xs text-[#7E786D]">
            {currentSlide.scriptInfo}
          </span>
        </div>
      </div>
    </div>
  );
};
