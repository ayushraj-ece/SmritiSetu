import React from 'react';
import { BrandMark } from './BrandMark';

interface Props {
  variant?: 'horizontal' | 'vertical' | 'mark-only';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const SmritiSetuLogo: React.FC<Props> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const markSize = size === 'sm' ? 30 : size === 'lg' ? 48 : 36;
  const devanagariSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  if (variant === 'mark-only') {
    return <BrandMark size={markSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="p-2 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
        <BrandMark size={markSize} />
      </div>

      <div className="flex flex-col justify-center text-left">
        <div className="flex items-baseline gap-2">
          <span className={`font-bold tracking-tight text-[#0F172A] ${devanagariSize}`}>
            स्मृतिसेतु
          </span>
          <span className="text-[11px] font-extrabold text-[#0284C7] tracking-wider uppercase">
            SMRITISETU
          </span>
        </div>

        {showTagline && (
          <p className="text-[11px] font-medium text-[#64748B] tracking-normal">
            Dementia Care & Cognitive Assessment
          </p>
        )}
      </div>
    </div>
  );
};
