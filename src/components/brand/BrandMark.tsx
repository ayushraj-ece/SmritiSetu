import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const BrandMark: React.FC<Props> = ({ className = 'w-8 h-8', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="SmritiSetu Medical Emblem"
    >
      {/* Outer Medical Arc (Setu Bridge) */}
      <path
        d="M 14 65 C 24 28, 76 28, 86 65"
        stroke="#0284C7"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Memory Core Pulse */}
      <path
        d="M 50 20 C 64 20, 68 34, 50 48 C 32 34, 36 20, 50 20 Z"
        fill="#38BDF8"
      />
      {/* Medical Cross/Human Node */}
      <circle cx="50" cy="58" r="12" fill="#0F172A" />
      <path d="M50 51 V65 M43 58 H57" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};
