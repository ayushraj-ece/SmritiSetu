import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  variant: 'blue' | 'green' | 'peach' | 'purple';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const variantStyles = {
  blue: {
    bg: 'bg-[#EEF2FE]',
    border: 'border-[#DBE5FF]/60',
    iconBg: 'bg-[#DBE5FF]',
    iconColor: 'text-[#3B82F6]',
    chevron: 'text-[#3B82F6]'
  },
  green: {
    bg: 'bg-[#EFF9F2]',
    border: 'border-[#D5F2DF]/60',
    iconBg: 'bg-[#D5F2DF]',
    iconColor: 'text-[#16A34A]',
    chevron: 'text-[#16A34A]'
  },
  peach: {
    bg: 'bg-[#FFF5EB]',
    border: 'border-[#FFE5D3]/60',
    iconBg: 'bg-[#FFE5D3]',
    iconColor: 'text-[#EA580C]',
    chevron: 'text-[#EA580C]'
  },
  purple: {
    bg: 'bg-[#F5EFFF]',
    border: 'border-[#E9DBFF]/60',
    iconBg: 'bg-[#E9DBFF]',
    iconColor: 'text-[#9333EA]',
    chevron: 'text-[#9333EA]'
  }
};

export const SoftActionTile: React.FC<Props> = ({
  variant,
  icon,
  title,
  subtitle,
  onClick
}) => {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`${styles.bg} border ${styles.border} p-4 sm:p-5 rounded-3xl text-left cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between min-h-[145px] sm:min-h-[155px] group`}
    >
      {/* Top Row: Large Rounded Icon Container on Left, Chevron Arrow on Right */}
      <div className="flex items-center justify-between w-full">
        <div className={`w-13 h-13 sm:w-14 sm:h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center shrink-0 shadow-2xs`}>
          <div className={`${styles.iconColor} flex items-center justify-center`}>
            {icon}
          </div>
        </div>

        <ChevronRight className={`w-5 h-5 ${styles.chevron} transform group-hover:translate-x-1 transition-transform opacity-80`} />
      </div>

      {/* Bottom Text Area */}
      <div className="space-y-0.5 mt-3">
        <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 leading-snug tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-normal">
          {subtitle}
        </p>
      </div>
    </button>
  );
};

