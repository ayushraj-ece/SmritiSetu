import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { voiceService } from '../services/voiceService';
import { offlineStorage } from '../services/offlineStorage';
import { dataService } from '../services/dataService';
import { adaptiveEngine } from '../ai/adaptiveEngine';
import type { AdaptiveEvaluation } from '../types';
import confetti from 'canvas-confetti';
import { ArrowLeft, RefreshCw, CheckCircle2, Award, Type } from 'lucide-react';

interface Props {
  patientId: string;
  onClose: () => void;
}

const ROUTINE_QUESTIONS = [
  {
    questionEn: "What normally comes right after eating morning breakfast?",
    questionAs: "পুৱাৰ আহাৰ খোৱাৰ পিছত কি কৰা হয়?",
    options: [
      { id: 'meds', textEn: 'Take Morning Medicine', textAs: 'ৰাতিপুৱাৰ ঔষধ খোৱা', icon: '💊', isCorrect: true },
      { id: 'sleep', textEn: 'Go to Sleep for Night', textAs: 'ৰাতিৰ বাবে শুবলৈ যোৱা', icon: '🌙', isCorrect: false },
      { id: 'dinner', textEn: 'Eat Heavy Dinner', textAs: 'ৰাতিৰ আহাৰ খোৱা', icon: '🍲', isCorrect: false }
    ]
  },
  {
    questionEn: "When the sun sets in the evening, what should you do?",
    questionAs: "গধূলি বেলি মাৰ যোৱাৰ পিছত কি কৰা উচিত?",
    options: [
      { id: 'walk', textEn: 'Gentle Evening Walk / Prayer', textAs: 'গধূলিৰ প্ৰাৰ্থনা / ফুলনি ঘূৰা', icon: '🕯️', isCorrect: true },
      { id: 'bath', textEn: 'Cold Morning Bath', textAs: 'পুৱাৰ গা ধোৱা', icon: '🚿', isCorrect: false },
      { id: 'lunch', textEn: 'Eat Lunch', textAs: 'দুপৰীয়াৰ আহাৰ খোৱা', icon: '🍚', isCorrect: false }
    ]
  },
  {
    questionEn: "During a warm afternoon, what is best to stay healthy?",
    questionAs: "দুপৰীয়া শৰীৰ সুস্থ ৰাখিবলৈ কি কৰা উচিত?",
    options: [
      { id: 'water', textEn: 'Drink Fresh Water', textAs: 'পানী খোৱা', icon: '💧', isCorrect: true },
      { id: 'run', textEn: 'Run a Long Marathon', textAs: 'টান পৰিশ্ৰম কৰা', icon: '🏃', isCorrect: false },
      { id: 'dark', textEn: 'Turn Off All Lights', textAs: 'সকলো লাইট বন্ধ কৰা', icon: '💡', isCorrect: false }
    ]
  }
];

export const RoutineGame: React.FC<Props> = ({ patientId, onClose }) => {
  const { t, language } = useLanguage();
  const [level, setLevel] = useState<number>(() => offlineStorage.getDifficultyLevels().routine || 2);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [, setSelectedOptionId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluation | null>(null);

  const activeQuestion = ROUTINE_QUESTIONS[currentQuestionIndex % ROUTINE_QUESTIONS.length];

  const initGame = (currentLvl: number) => {
    const qIdx = (currentLvl - 1) % ROUTINE_QUESTIONS.length;
    setCurrentQuestionIndex(qIdx);
    setSelectedOptionId(null);
    setGameState('playing');
    setStartTime(Date.now());

    const question = ROUTINE_QUESTIONS[qIdx];
    const text = language === 'as' ? question.questionAs : question.questionEn;
    voiceService.speak(text, language);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    if (gameState !== 'playing') return;
    setSelectedOptionId(optionId);

    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const accuracy = isCorrect ? 100 : 0;
    const score = accuracy;

    const evalRes = adaptiveEngine.evaluatePerformance({
      patientId,
      gameCategory: 'routine',
      currentLevel: level,
      score,
      accuracyPercentage: accuracy,
      responseTimeSeconds: elapsedSec
    });

    setEvaluation(evalRes);
    setGameState('result');

    dataService.saveGameResult({
      patientId,
      gameCategory: 'routine',
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
      voiceService.speak(language === 'as' ? 'অতি সুন্দৰ! শুদ্ধ উত্তৰ।' : 'Well done! Correct response.', language);
    } else {
      voiceService.speak(language === 'as' ? 'ভালো চেষ্টা! পিছৰবাৰ আৰু ভাল হ\'ব।' : 'Good attempt! Try again.', language);
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
          <Type className="w-5 h-5 text-[#8B5CF6]" />
          <h1 className="text-lg font-extrabold text-slate-900">
            Word Builder
          </h1>
        </div>

        <span className="px-3.5 py-1 bg-[#E8F5E9] text-[#1E7F53] rounded-full text-xs font-extrabold shadow-2xs">
          Level {level}
        </span>
      </div>

      {/* Playing Phase */}
      {gameState === 'playing' && (
        <div className="py-6 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {language === 'as' ? activeQuestion.questionAs : activeQuestion.questionEn}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Select the best answer from the choices below
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {activeQuestion.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                className="w-full p-5 bg-white border border-slate-200/80 hover:border-[#1E7F53] hover:bg-[#EFFBF2] rounded-3xl text-left cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-2xl flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                    {opt.icon}
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {language === 'as' ? opt.textAs : opt.textEn}
                  </span>
                </div>
                <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#1E7F53] group-hover:text-white flex items-center justify-center text-slate-400 text-xs font-bold transition-colors shrink-0">
                  →
                </span>
              </button>
            ))}
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
              Activity Completed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Great response! Your performance scores are saved.
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
