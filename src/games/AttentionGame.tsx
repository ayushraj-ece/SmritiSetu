import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { voiceService } from '../services/voiceService';
import { offlineStorage } from '../services/offlineStorage';
import { dataService } from '../services/dataService';
import { adaptiveEngine } from '../ai/adaptiveEngine';
import type { AdaptiveEvaluation } from '../types';
import confetti from 'canvas-confetti';
import { ArrowLeft, RefreshCw, CheckCircle2, Award, Hash } from 'lucide-react';

interface Props {
  patientId: string;
  onClose: () => void;
}

const ITEMS = [
  { id: 'red_flower', name: 'Red Flower', nameAs: 'ৰঙা ফুল', icon: '🌺', isTarget: true },
  { id: 'tea_leaf', name: 'Tea Leaf', nameAs: 'চাহ পাত', icon: '🍃', isTarget: false },
  { id: 'bamboo', name: 'Bamboo Stick', nameAs: 'বাঁহৰ লাঠি', icon: '🎋', isTarget: false },
  { id: 'sun', name: 'Morning Sun', nameAs: 'বেলি', icon: '☀️', isTarget: false },
  { id: 'star', name: 'Bright Star', nameAs: 'তৰা', icon: '⭐', isTarget: false },
  { id: 'apple', name: 'Red Apple', nameAs: 'আপেল', icon: '🍎', isTarget: false },
];

export const AttentionGame: React.FC<Props> = ({ patientId, onClose }) => {
  const { t, language } = useLanguage();
  const [level, setLevel] = useState<number>(() => offlineStorage.getDifficultyLevels().attention || 2);
  
  const [gridItems, setGridItems] = useState<{ uid: string; item: typeof ITEMS[0] }[]>([]);
  const [tappedUids, setTappedUids] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluation | null>(null);

  const targetItem = ITEMS[0];

  const initGame = (currentLvl: number) => {
    const totalCount = Math.min(4 + (currentLvl - 1) * 2, 12);
    const targetCount = Math.min(2 + Math.floor(currentLvl / 2), 4);
    
    const itemsList: { uid: string; item: typeof ITEMS[0] }[] = [];
    
    for (let i = 0; i < targetCount; i++) {
      itemsList.push({ uid: `target_${i}_${Math.random()}`, item: targetItem });
    }

    const distractors = ITEMS.filter(i => !i.isTarget);
    while (itemsList.length < totalCount) {
      const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
      itemsList.push({ uid: `distractor_${itemsList.length}_${Math.random()}`, item: randomDistractor });
    }

    setGridItems(itemsList.sort(() => 0.5 - Math.random()));
    setTappedUids([]);
    setGameState('playing');
    setStartTime(Date.now());

    const promptText = language === 'as' 
      ? `সকলো ${targetItem.nameAs} বিচাৰি টাচ কৰক` 
      : `Tap all ${targetItem.name}`;
    voiceService.speak(promptText, language);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleTap = (uid: string) => {
    if (gameState !== 'playing') return;
    if (tappedUids.includes(uid)) return;
    
    setTappedUids(prev => [...prev, uid]);
  };

  const handleFinish = () => {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const totalTargets = gridItems.filter(g => g.item.isTarget).length;
    
    let correctTaps = 0;
    let wrongTaps = 0;

    tappedUids.forEach(uid => {
      const found = gridItems.find(g => g.uid === uid);
      if (found?.item.isTarget) {
        correctTaps++;
      } else {
        wrongTaps++;
      }
    });

    const rawAccuracy = Math.max(0, (correctTaps - wrongTaps * 0.5) / totalTargets) * 100;
    const accuracy = Math.min(100, Math.round(rawAccuracy));
    const score = accuracy;

    const evalRes = adaptiveEngine.evaluatePerformance({
      patientId,
      gameCategory: 'attention',
      currentLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec
    });

    setEvaluation(evalRes);
    setGameState('result');

    dataService.saveGameResult({
      patientId,
      gameCategory: 'attention',
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
      voiceService.speak(language === 'as' ? 'অতি সুন্দৰ! আপুনি বৰ ভালকৈ কৰিলে।' : 'Great focus! Well done.', language);
    } else {
      voiceService.speak(language === 'as' ? 'ভালো চেষ্টা! পিছৰবাৰ আৰু ভাল হ\'ব।' : 'Good effort! Keep practicing.', language);
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
          <Hash className="w-5 h-5 text-[#3B82F6]" />
          <h1 className="text-lg font-extrabold text-slate-900">
            Number Recall
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
              Focus & Spot the Target
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tap all the target items below
            </p>
          </div>

          <div className="bg-[#EFFBF2] border border-[#DCFCE7]/80 p-4 rounded-3xl inline-flex items-center justify-center gap-3 text-sm font-extrabold text-[#1E7F53] shadow-2xs">
            <span className="text-2xl">{targetItem.icon}</span>
            <span>Target: {language === 'as' ? targetItem.nameAs : targetItem.name}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
            {gridItems.map(({ uid, item }) => {
              const isTapped = tappedUids.includes(uid);
              return (
                <button
                  key={uid}
                  onClick={() => handleTap(uid)}
                  className={`p-4 rounded-3xl border text-center cursor-pointer transition-all min-h-[100px] flex flex-col items-center justify-center gap-1 ${
                    isTapped 
                      ? item.isTarget 
                        ? 'bg-[#EBFBF0] border-2 border-[#1E7F53] text-[#1E7F53] shadow-2xs font-extrabold'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-600'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl">{item.icon}</div>
                  <div className="text-[11px] font-bold">
                    {language === 'as' ? item.nameAs : item.name}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-2xl text-base font-extrabold shadow-md transition-all cursor-pointer active:scale-98"
          >
            Finish Activity
          </button>
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
              Activity Completed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Great focus! Your evaluation is recorded.
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
