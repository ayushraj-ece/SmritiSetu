import React from 'react';
import { Home, Gamepad2, Calendar, LayoutGrid } from 'lucide-react';
import { VoiceAssistantButton } from './VoiceAssistantButton';

export type PatientTab = 'home' | 'games' | 'reminders' | 'more';

interface Props {
  activeTab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
}

export const PatientBottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-8 py-2.5 shadow-xl">
      <div className="flex items-center justify-around relative max-w-lg sm:max-w-xl mx-auto">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home' 
              ? 'bg-[#E8F5E9] text-[#1E7F53] font-extrabold shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#1E7F53] fill-current' : 'text-slate-400'}`} />
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        {/* Tab 2: Games */}
        <button
          onClick={() => onTabChange('games')}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'games' 
              ? 'bg-[#E8F5E9] text-[#1E7F53] font-extrabold shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Gamepad2 className={`w-5 h-5 ${activeTab === 'games' ? 'text-[#1E7F53]' : 'text-slate-400'}`} />
          <span className="text-[11px] leading-tight">Games</span>
        </button>

        {/* Floating Center Voice Assistant Button */}
        <div className="flex flex-col items-center justify-center">
          <VoiceAssistantButton />
        </div>

        {/* Tab 3: Reminders */}
        <button
          onClick={() => onTabChange('reminders')}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'reminders' 
              ? 'bg-[#E8F5E9] text-[#1E7F53] font-extrabold shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'reminders' ? 'text-[#1E7F53]' : 'text-slate-400'}`} />
          <span className="text-[11px] leading-tight">Reminders</span>
        </button>

        {/* Tab 4: More */}
        <button
          onClick={() => onTabChange('more')}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'more' 
              ? 'bg-[#E8F5E9] text-[#1E7F53] font-extrabold shadow-2xs' 
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${activeTab === 'more' ? 'text-[#1E7F53]' : 'text-slate-400'}`} />
          <span className="text-[11px] leading-tight">More</span>
        </button>
      </div>
    </div>
  );
};

