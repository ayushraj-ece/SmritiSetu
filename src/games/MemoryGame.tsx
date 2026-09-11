import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { voiceService } from '../services/voiceService';
import { offlineStorage } from '../services/offlineStorage';
import { dataService } from '../services/dataService';
import { adaptiveEngine } from '../ai/adaptiveEngine';
import type { AdaptiveEvaluation } from '../types';
import confetti from 'canvas-confetti';
import { RefreshCw, ArrowLeft, CheckCircle2, Award, Layers, Eye, Clock, Sparkles } from 'lucide-react';

interface Props {
  patientId: string;
  initialLevel?: number;
  onClose: () => void;
}

const MEMORY_ITEMS = [
  { id: 'tea', name: 'Tea Leaf', nameAs: 'চাহ পাত', icon: '🍃' },
  { id: 'rhino', name: 'Rhino', nameAs: 'গঁৰ', icon: '🦏' },
  { id: 'bamboo', name: 'Bamboo Craft', nameAs: 'বাঁহৰ সাজ', icon: '🎋' },
  { id: 'hornbill', name: 'Hornbill', nameAs: 'ধনেশ পক্ষী', icon: '🦅' },
  { id: 'shawl', name: 'Woven Shawl', nameAs: 'শাল', icon: '🧣' },
  { id: 'fish', name: 'River Fish', nameAs: 'মাছ', icon: '🐟' },
  { id: 'lamp', name: 'Brass Lamp', nameAs: 'ছাকি', icon: '🪔' },
  { id: 'rice', name: 'Sticky Rice', nameAs: 'চাউল', icon: '🍚' },
];

export const MemoryGame: React.FC<Props> = ({ patientId, initialLevel, onClose }) => {
  const { t, language } = useLanguage();
  const [level, setLevel] = useState<number>(() => initialLevel || offlineStorage.getDifficultyLevels().memory || 1);
  
  const [gameState, setGameState] = useState<'showing' | 'recalling' | 'result'>('showing');
  const [targetObjects, setTargetObjects] = useState<typeof MEMORY_ITEMS>([]);
  const [gridObjects, setGridObjects] = useState<typeof MEMORY_ITEMS>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [maxDisplayTime, setMaxDisplayTime] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluation | null>(null);

  const initGame = (currentLvl: number) => {
    const itemCount = Math.min(2 + (currentLvl - 1), 5);
    const shuffled = [...MEMORY_ITEMS].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffled.slice(0, itemCount);
    
    const gridCount = Math.min(itemCount + 3, MEMORY_ITEMS.length);
    const gridSelection = [...MEMORY_ITEMS].sort(() => 0.5 - Math.random()).slice(0, gridCount);
    
    selectedTargets.forEach(target => {
      if (!gridSelection.find(g => g.id === target.id)) {
        gridSelection[0] = target;
      }
    });

    const displayTime = Math.max(6 - (currentLvl - 1), 4);
    setMaxDisplayTime(displayTime);
    setTargetObjects(selectedTargets);
    setGridObjects(gridSelection.sort(() => 0.5 - Math.random()));
    setSelectedIds([]);
    setGameState('showing');
    setTimerSeconds(displayTime);
    setStartTime(Date.now());

    const text = language === 'as' 
      ? 'এই বস্তুবোৰ মনত ৰাখক! কেইছেকেণ্ডমান পিছত নোহোৱা হ\'ব।' 
      : 'Memorize these items! They will disappear shortly.';
    voiceService.speak(text, language);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  // Timer effect for 'showing' phase
  useEffect(() => {
    if (gameState !== 'showing' || timerSeconds === null) return;

    if (timerSeconds <= 0) {
      setGameState('recalling');
      setStartTime(Date.now());
      const promptText = language === 'as' 
        ? 'পূৰ্বে দেখা পোৱা বস্তুবোৰ বাছি উলিয়াওক' 
        : 'Select all items that were displayed earlier';
      voiceService.speak(promptText, language);
      return;
    }

    const timer = setTimeout(() => {
      setTimerSeconds(prev => (prev !== null ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, timerSeconds, language]);

  const handleSelectObject = (id: string) => {
    if (gameState !== 'recalling') return;
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSubmitRecall = () => {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const targetIds = targetObjects.map(t => t.id);
    
    let correctCount = 0;
    selectedIds.forEach(id => {
      if (targetIds.includes(id)) correctCount++;
    });

    const incorrectCount = selectedIds.length - correctCount;
    const rawAccuracy = Math.max(0, (correctCount - incorrectCount * 0.5) / targetIds.length) * 100;
    const accuracy = Math.min(100, Math.round(rawAccuracy));
    const score = accuracy;

    const evalRes = adaptiveEngine.evaluatePerformance({
      patientId,
      gameCategory: 'memory',
      currentLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec
    });

    setEvaluation(evalRes);
    setGameState('result');

    dataService.saveGameResult({
      patientId,
      gameCategory: 'memory',
      difficultyLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec,
      timestamp: Date.now(),
      synced: false
    });

    dataService.saveEvaluation(evalRes);

    if (accuracy >= 70) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      voiceService.speak(language === 'as' ? 'অতি সুন্দৰ! আপুনি বৰ ভালকৈ কৰিলে।' : 'Great job! You remembered well.', language);
    } else {
      voiceService.speak(language === 'as' ? 'ভালো চেষ্টা! পিছৰবাৰ আৰু ভাল হ\'ব।' : 'Good effort! Practice makes perfect.', language);
    }
  };

  const progressPercent = timerSeconds !== null ? Math.round((timerSeconds / maxDisplayTime) * 100) : 100;

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
          <Layers className="w-5 h-5 text-[#EC4899]" />
          <h1 className="text-lg font-extrabold text-slate-900">
            Memory Match
          </h1>
        </div>

        <span className="px-3.5 py-1 bg-[#E8F5E9] text-[#1E7F53] rounded-full text-xs font-extrabold shadow-2xs">
          Level {level}
        </span>
      </div>

      {/* Showing Phase (Memorization Screen) */}
      {gameState === 'showing' && (
        <div className="py-4 space-y-6 animate-in fade-in duration-300">
          
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full mb-1 border border-pink-100">
              <Eye className="w-3.5 h-3.5" />
              <span>Memorize Phase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'as' ? 'এই বস্তুবোৰ মনত ৰাখক' : 'Remember these items:'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Look closely at the items shown below before they disappear
            </p>
          </div>

          {/* Dynamic Countdown Progress Timer */}
          <div className="bg-[#FFF8E7] border border-[#FDE68A] p-4 rounded-3xl space-y-2 text-center shadow-2xs">
            <div className="flex items-center justify-between px-2 text-xs font-extrabold text-[#8C6D1F]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Disappearing in</span>
              </span>
              <span className="text-sm font-black text-amber-800">{timerSeconds ?? maxDisplayTime} seconds</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Grid of Target Items to Memorize */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            {targetObjects.map((obj) => (
              <div 
                key={obj.id} 
                className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center shadow-2xs space-y-3 transform hover:scale-102 transition-all flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="text-5xl drop-shadow-xs">{obj.icon}</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  {language === 'as' ? obj.nameAs : obj.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recalling Phase (Selection Screen) */}
      {gameState === 'recalling' && (
        <div className="py-4 space-y-6 animate-in fade-in duration-300">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#1E7F53] text-xs font-bold rounded-full mb-1 border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recall Phase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'as' ? 'পূৰ্বে দেখা পোৱা বস্তুবোৰ বাছি উলিয়াওক:' : 'Select all items displayed earlier:'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tap the items you saw earlier
            </p>
          </div>

          {/* Grid of Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gridObjects.map(obj => {
              const isSelected = selectedIds.includes(obj.id);
              return (
                <button
                  key={obj.id}
                  onClick={() => handleSelectObject(obj.id)}
                  className={`p-5 rounded-3xl border text-center cursor-pointer transition-all min-h-[135px] flex flex-col items-center justify-center gap-2 relative ${
                    isSelected 
                      ? 'bg-[#EBFBF0] border-2 border-[#1E7F53] text-[#1E7F53] shadow-sm font-extrabold scale-102' 
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1E7F53] text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="text-4xl drop-shadow-xs">{obj.icon}</div>
                  <div className="text-xs sm:text-sm font-bold leading-snug">
                    {language === 'as' ? obj.nameAs : obj.name}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmitRecall}
            disabled={selectedIds.length === 0}
            className={`w-full py-4 text-base font-extrabold rounded-2xl transition-all shadow-md cursor-pointer ${
              selectedIds.length > 0 
                ? 'bg-[#1E7F53] hover:bg-[#146743] text-white active:scale-98' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Submit Answer ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Result Phase */}
      {gameState === 'result' && evaluation && (
        <div className="py-6 text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-[#E8F5E9] text-[#1E7F53] rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-[#1E7F53]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Activity Completed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Great effort! Your performance scores are updated.
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
