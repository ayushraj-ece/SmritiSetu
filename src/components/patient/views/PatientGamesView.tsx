import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  Hash, 
  Puzzle, 
  Type, 
  Shapes, 
  Palette 
} from 'lucide-react';
import type { GameCategory } from '../../../types';

export interface GameItem {
  id: string;
  category: GameCategory;
  title: string;
  subtitle: string;
  iconType: 'memory' | 'number' | 'puzzle' | 'word' | 'shape' | 'color';
  icon: string;
  color: 'pink' | 'blue' | 'yellow' | 'purple' | 'green' | 'coral';
  tags: string[];
}

export const renderGameIcon = (iconType: string, className = "w-6 h-6") => {
  switch (iconType) {
    case 'memory':
      return <Layers className={`${className} text-[#EC4899]`} />;
    case 'number':
      return <Hash className={`${className} text-[#3B82F6]`} />;
    case 'puzzle':
      return <Puzzle className={`${className} text-[#D97706]`} />;
    case 'word':
      return <Type className={`${className} text-[#8B5CF6]`} />;
    case 'shape':
      return <Shapes className={`${className} text-[#10B981]`} />;
    case 'color':
    default:
      return <Palette className={`${className} text-[#E11D48]`} />;
  }
};

export const GAMES_LIST: GameItem[] = [
  {
    id: 'memory_match',
    category: 'memory',
    title: 'Memory Match',
    subtitle: 'Find the matching pairs',
    iconType: 'memory',
    icon: '🍎🍎',
    color: 'pink',
    tags: ['Memory', 'Focus', 'Visual Skills']
  },
  {
    id: 'number_recall',
    category: 'attention',
    title: 'Number Recall',
    subtitle: 'Remember the sequence',
    iconType: 'number',
    icon: '1️⃣2️⃣3️⃣',
    color: 'blue',
    tags: ['Attention', 'Numbers', 'Short-term']
  },
  {
    id: 'picture_puzzle',
    category: 'pattern',
    title: 'Picture Puzzle',
    subtitle: 'Complete the image',
    iconType: 'puzzle',
    icon: '🧩',
    color: 'yellow',
    tags: ['Spatial', 'Visual', 'Focus']
  },
  {
    id: 'word_builder',
    category: 'routine',
    title: 'Word Builder',
    subtitle: 'Make meaningful words',
    iconType: 'word',
    icon: '🔤',
    color: 'purple',
    tags: ['Language', 'Vocabulary', 'Logic']
  },
  {
    id: 'shape_spotter',
    category: 'pattern',
    title: 'Shape Spotter',
    subtitle: 'Find the correct shape',
    iconType: 'shape',
    icon: '🟢🟦🔺',
    color: 'green',
    tags: ['Recognition', 'Shapes', 'Speed']
  },
  {
    id: 'color_recall',
    category: 'memory',
    title: 'Color Recall',
    subtitle: 'Remember the colors',
    iconType: 'color',
    icon: '🌸',
    color: 'coral',
    tags: ['Color Memory', 'Focus', 'Recall']
  }
];

interface Props {
  onSelectGame: (game: GameItem) => void;
}

export const PatientGamesView: React.FC<Props> = ({ onSelectGame }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All Games');

  const categories = ['All Games', 'Memory', 'Attention', 'Logic', 'Language'];

  const filteredGames = GAMES_LIST.filter(g => {
    if (selectedFilter === 'All Games') return true;
    if (selectedFilter === 'Memory') return g.category === 'memory';
    if (selectedFilter === 'Attention') return g.category === 'attention';
    if (selectedFilter === 'Logic') return g.category === 'pattern';
    if (selectedFilter === 'Language') return g.category === 'routine';
    return true;
  });

  const getTileStyles = (color: string) => {
    switch (color) {
      case 'pink':
        return {
          bg: 'bg-[#FFEBEB]',
          border: 'border-pink-100/60',
          chevron: 'text-pink-500'
        };
      case 'blue':
        return {
          bg: 'bg-[#EBF5FF]',
          border: 'border-blue-100/60',
          chevron: 'text-blue-500'
        };
      case 'yellow':
        return {
          bg: 'bg-[#FFF8E7]',
          border: 'border-amber-100/60',
          chevron: 'text-amber-500'
        };
      case 'purple':
        return {
          bg: 'bg-[#F5EFFF]',
          border: 'border-purple-100/60',
          chevron: 'text-purple-500'
        };
      case 'green':
        return {
          bg: 'bg-[#EBFBF0]',
          border: 'border-emerald-100/60',
          chevron: 'text-emerald-500'
        };
      case 'coral':
      default:
        return {
          bg: 'bg-[#FFF0F0]',
          border: 'border-rose-100/60',
          chevron: 'text-rose-500'
        };
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-300 px-4 sm:px-6">
      
      {/* Top Header & Right Cursive Callout Badge */}
      <div className="flex items-start justify-between pt-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            MINDCARE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Mind Games
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium pt-0.5">
            Play • Practice • Stay Sharp
          </p>
        </div>

        {/* Top Right Callout Badge */}
        <div className="bg-[#EBF7F0] border border-[#DCFCE7]/80 px-3 py-2 rounded-2xl flex items-center gap-2 shrink-0 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
            👵
          </div>
          <p className="font-script text-xs sm:text-sm font-bold text-[#1E7F53] leading-tight text-right">
            A<br />
            healthier mind<br />
            brighter days! 💚
          </p>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedFilter === cat
                ? 'bg-[#1E7F53] text-white shadow-2xs'
                : 'bg-slate-100/80 text-slate-600 border border-slate-200/60 hover:bg-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hero Featured Game Banner Card ("Small Games Big Benefits") */}
      <div className="bg-[#EBFBF0] border border-[#DCFCE7]/60 p-6 rounded-3xl shadow-2xs flex items-center justify-between gap-4 relative overflow-hidden min-h-[165px]">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
            Small<br />
            Games<br />
            Big Benefits
          </h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed pt-0.5">
            Keep your mind active<br />and happy!
          </p>
          <button
            onClick={() => onSelectGame(GAMES_LIST[0])}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#1E7F53] hover:bg-[#146743] text-white text-xs font-extrabold rounded-full shadow-2xs transition-all cursor-pointer mt-2"
          >
            <span>Let's Play</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Artwork Illustration */}
        <div className="relative z-10 shrink-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/90 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl relative overflow-hidden">
            <span className="text-5xl">👵</span>
            <span className="absolute top-1 right-2 text-base">🧩</span>
            <span className="absolute bottom-1 left-2 text-base">💡</span>
          </div>
        </div>
      </div>

      {/* Section: Popular Games (2x3 Grid) */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Popular Games
          </h3>
          <span 
            onClick={() => setSelectedFilter('All Games')}
            className="text-xs font-bold text-[#3B82F6] cursor-pointer hover:underline flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 2-Column Grid with Minimalist Vector Icons */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {filteredGames.map((game) => {
            const tileStyles = getTileStyles(game.color);
            return (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`${tileStyles.bg} border ${tileStyles.border} p-4 sm:p-5 rounded-3xl cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between min-h-[140px] group`}
              >
                <div className="flex items-center justify-between w-full">
                  {/* Minimalist White Icon Circle */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-2xs shrink-0">
                    {renderGameIcon(game.iconType, "w-5 h-5 sm:w-6 sm:h-6")}
                  </div>
                  <ChevronRight className={`w-4 h-4 ${tileStyles.chevron} transform group-hover:translate-x-1 transition-transform`} />
                </div>

                <div className="mt-3 space-y-0.5">
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {game.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    {game.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
