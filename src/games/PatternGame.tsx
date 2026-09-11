import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { voiceService } from '../services/voiceService';
import { offlineStorage } from '../services/offlineStorage';
import { dataService } from '../services/dataService';
import { adaptiveEngine } from '../ai/adaptiveEngine';
import type { AdaptiveEvaluation } from '../types';
import confetti from 'canvas-confetti';
import { ArrowLeft, RefreshCw, CheckCircle2, Award, Puzzle } from 'lucide-react';

interface Props {
  patientId: string;
  onClose: () => void;
}

const PATTERN_ITEMS = [
  { id: 'apple', icon: '🍎', name: 'Apple', nameAs: 'আপেল' },
  { id: 'banana', icon: '🍌', name: 'Banana', nameAs: 'কল' },
  { id: 'tea', icon: '🍃', name: 'Tea Leaf', nameAs: 'চাহ পাত' },
  { id: 'sun', icon: '☀️', name: 'Sun', nameAs: 'সূৰ্য' },
];

export const PatternGame: React.FC<Props> = ({ patientId, onClose }) => {
  const { t, language } = useLanguage();
  const [level, setLevel] = useState<number>(() => offlineStorage.getDifficultyLevels().pattern || 2);
  
  const [sequence, setSequence] = useState<typeof PATTERN_ITEMS>([]);
  const [correctNextItem, setCorrectNextItem] = useState<typeof PATTERN_ITEMS[0] | null>(null);
  const [options, setOptions] = useState<typeof PATTERN_ITEMS>([]);
  const [, setSelectedOption] = useState<typeof PATTERN_ITEMS[0] | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluation | null>(null);

  const initGame = (currentLvl: number) => {
    const itemA = PATTERN_ITEMS[0];
    const itemB = PATTERN_ITEMS[1];
    const itemC = PATTERN_ITEMS[2];

    let seq: typeof PATTERN_ITEMS = [];
    let nextItem: typeof PATTERN_ITEMS[0];

    if (currentLvl === 1 || currentLvl === 2) {
      seq = [itemA, itemB, itemA, itemB];
      nextItem = itemA;
    } else if (currentLvl === 3 || currentLvl === 4) {
      seq = [itemA, itemB, itemC, itemA, itemB];
      nextItem = itemC;
    } else {
      seq = [itemA, itemA, itemB, itemB, itemA];
      nextItem = itemA;
    }

    setSequence(seq);
    setCorrectNextItem(nextItem);
    setSelectedOption(null);

    const shuffledOptions = [...PATTERN_ITEMS].sort(() => 0.5 - Math.random());
    setOptions(shuffledOptions);
    
    setGameState('playing');
    setStartTime(Date.now());

    const promptText = language === 'as' 
      ? 'এই ক্ৰমটোৰ পিছত কি আহিব?' 
      : 'What item comes next in the sequence?';
    voiceService.speak(promptText, language);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleSelect = (item: typeof PATTERN_ITEMS[0]) => {
    if (gameState !== 'playing') return;
    setSelectedOption(item);

    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = item.id === correctNextItem?.id;
    const accuracy = isCorrect ? 100 : 0;
    const score = accuracy;

    const evalRes = adaptiveEngine.evaluatePerformance({
      patientId,
      gameCategory: 'pattern',
      currentLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec
    });

    setEvaluation(evalRes);
    setGameState('result');

    dataService.saveGameResult({
      patientId,
      gameCategory: 'pattern',
      difficultyLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec,
      timestamp: Date.now(),
      synced: false
    });

    dataService.saveEvaluation(evalRes);

    if (isCorrect) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      voiceService.speak(language === 'as' ? 'সুন্দৰ! আপুনি শুদ্ধ উত্তৰ দিলে।' : 'Spot on! You found the pattern.', language);
    } else {
      voiceService.speak(language === 'as' ? 'ভালো চেষ্টা! পিছৰবাৰ আৰু ভাল হ\'ব।' : 'Good attempt! Try again next round.', language);
    }
  };

  return (
    <div className="space-y-6 max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-[#F59E0B]" />
          <h1 className="text-lg font-extrabold text-slate-900">
            Picture Puzzle
          </h1>
        </div>

        <span className="px-3.5 py-1 bg-[#E8F5E9] text-[#1E7F53] rounded-full text-xs font-extrabold shadow-2xs">
          Level {level}
        </span>
      </div>

      {/* Playing Phase */}
      {gameState === 'playing' && (
        <div className="py-6 text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Complete the Pattern
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              What comes next in the sequence below?
            </p>
          </div>

          {/* Sequence Row */}
          <div className="bg-[#FFF8E7] border border-[#FDE68A]/80 p-6 rounded-3xl flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto shadow-2xs">
            {sequence.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex flex-col items-center justify-center text-2xl sm:text-3xl shadow-2xs border border-amber-100 shrink-0">
                  <span>{item.icon}</span>
                </div>
                <span className="text-slate-300 text-lg font-bold">→</span>
              </React.Fragment>
            ))}

            {/* Question Mark Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1E7F53] text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-sm shrink-0 animate-pulse">
              ?
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Choose the correct next item:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {options.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-5 bg-white border border-slate-200/80 hover:border-[#1E7F53] hover:bg-[#EFFBF2] rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group shadow-2xs"
                >
                  <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'as' ? item.nameAs : item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Phase */}
      {gameState === 'result' && evaluation && (
        <div className="py-6 text-center space-y-6">
          <div className="w-16 h-16 bg-[#E8F5E9] text-[#1E7F53] rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-[#1E7F53]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pattern Solved!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Excellent pattern recognition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-6 rounded-3xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">{t('accuracy')}</span>
              <span className="text-3xl font-extrabold text-[#1E7F53]">{evaluation.accuracyPercentage}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">{t('score')}</span>
              <span className="text-3xl font-extrabold text-slate-900">{evaluation.performanceScore}</span>
            </div>
          </div>

          <div className="bg-[#EFFBF2] border border-[#DCFCE7]/80 p-5 rounded-3xl text-left space-y-2">
            <div className="flex items-center gap-2 text-[#1E7F53] font-extrabold text-xs sm:text-sm">
              <Award className="w-4 h-4 text-[#1E7F53]" />
              <span>AI Adaptive Evaluation</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              <span>Level {evaluation.previousLevel} ➔ Level {evaluation.newLevel}</span>
            </div>
            <p className="text-xs text-slate-600 font-medium bg-white p-3 rounded-2xl border border-slate-100">
              🧠 <span className="font-bold text-[#1E7F53]">AI Evaluation:</span> {evaluation.reason}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setLevel(evaluation.newLevel);
                initGame(evaluation.newLevel);
              }}
              className="flex-1 py-4 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Proceed to Level {evaluation.newLevel}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm cursor-pointer transition-all"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
