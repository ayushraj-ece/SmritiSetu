import React, { useState } from 'react';
import { ArrowLeft, Settings, Brain, ChevronRight } from 'lucide-react';
import type { GameItem } from './PatientGamesView';
import { renderGameIcon } from './PatientGamesView';

interface Props {
  game: GameItem;
  onBack: () => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const PatientGameDetailView: React.FC<Props> = ({
  game,
  onBack,
  onStartGame
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  return (
    <div className="space-y-6 pb-28 max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-300 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
          Mind Games
        </h1>

        <button className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Game Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center space-y-4 shadow-2xs">
        <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center border border-slate-100 shadow-sm">
          {renderGameIcon(game.iconType, "w-10 h-10")}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {game.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {game.subtitle}
          </p>
        </div>

        {/* Tag Pills matching reference UI */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
          {game.tags.map((tag, idx) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                idx === 0 ? 'bg-pink-100 text-pink-700 border border-pink-200/60' :
                idx === 1 ? 'bg-blue-100 text-blue-700 border border-blue-200/60' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Section: Choose Difficulty */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Choose Difficulty
          </h3>
          <p className="text-xs text-slate-400 font-medium pt-0.5">
            You can change this anytime.
          </p>
        </div>

        {/* 3 Difficulty Selector Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedDifficulty('easy')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
              selectedDifficulty === 'easy'
                ? 'bg-[#EFFBF2] border-2 border-[#1E7F53] text-[#1E7F53] shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100/60 flex items-center justify-center text-[#1E7F53] text-base">
              🌱
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold block text-slate-900">Easy</span>
              <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">4 pairs</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedDifficulty('medium')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
              selectedDifficulty === 'medium'
                ? 'bg-[#EFFBF2] border-2 border-[#1E7F53] text-[#1E7F53] shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100/60 flex items-center justify-center text-[#1E7F53] text-base">
              🌿
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold block text-slate-900">Medium</span>
              <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">6 pairs</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedDifficulty('hard')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
              selectedDifficulty === 'hard'
                ? 'bg-[#EFFBF2] border-2 border-[#1E7F53] text-[#1E7F53] shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100/60 flex items-center justify-center text-[#1E7F53] text-base">
              🌳
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold block text-slate-900">Hard</span>
              <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">8 pairs</span>
            </div>
          </button>
        </div>
      </div>

      {/* Section: How it helps? */}
      <div className="bg-[#F0F7FF] border border-blue-100/60 p-4 rounded-2xl shadow-2xs flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
            How it helps?
          </h4>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Improves short-term memory, attention and visual recognition.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => onStartGame(selectedDifficulty)}
        className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all transform active:scale-98"
      >
        <span>Start Game</span>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Cursive Motivational Callout Footer */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100/60 p-4 rounded-2xl text-center">
        <p className="font-script text-base sm:text-lg font-bold text-[#1E7F53]">
          Keep Going You're Doing Great! 💚
        </p>
      </div>

    </div>
  );
};
