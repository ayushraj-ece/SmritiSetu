import React, { useState, useEffect } from 'react';
import type { CustomMemoryQuestion } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';
import { dataService } from '../../services/dataService';
import { voiceService } from '../../services/voiceService';
import { adaptiveEngine } from '../../ai/adaptiveEngine';
import { useLanguage } from '../../i18n/LanguageContext';
import { Volume2, CheckCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  patientId: string;
  onFinish?: () => void;
}

export const PersonalMemoryQuizGame: React.FC<Props> = ({ patientId, onFinish }) => {
  const { language } = useLanguage();

  const [questions, setQuestions] = useState<CustomMemoryQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  useEffect(() => {
    const list = offlineStorage.getCustomQuestions(patientId);
    setQuestions(list);
    setStartTime(Date.now());
  }, [patientId]);

  const currentQ = questions[currentIndex];

  const handleSpeakQuestion = () => {
    if (currentQ) {
      voiceService.speak(`${currentQ.title}. ${currentQ.question}`, language);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctOptionIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      voiceService.speak('Correct answer! Excellent memory.', language);
    } else {
      voiceService.speak('Good effort! Let us check the next picture.', language);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    const timeSpent = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const calculatedScore = Math.round((correctCount / Math.max(1, questions.length)) * 100);
    setFinalScore(calculatedScore);
    setIsGameOver(true);

    // Save Game Result
    const gameResult = {
      patientId: patientId || 'ASM58291',
      gameCategory: 'memory' as const,
      difficultyLevel: 2,
      score: calculatedScore,
      accuracyPercentage: calculatedScore,
      responseTimeSeconds: timeSpent / Math.max(1, questions.length),
      timestamp: Date.now()
    };

    await dataService.saveGameResult(gameResult);

    // AI Adaptive Engine Evaluation
    adaptiveEngine.evaluatePerformance({
      patientId: patientId || 'MC-DEMO-001',
      gameCategory: 'memory',
      currentLevel: 2,
      score: calculatedScore,
      accuracyPercentage: calculatedScore,
      responseTimeSeconds: timeSpent / Math.max(1, questions.length)
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsGameOver(false);
    setStartTime(Date.now());
  };

  if (!currentQ || questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4 font-medium text-xs text-[#64748B]">
        <p>No photo memory questions available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-[#0F172A] font-sans">
      {!isGameOver ? (
        <>
          {/* Header Progress */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-[#F0F9FF] text-[#0284C7] px-3 py-1 rounded-full border border-[#BAE6FD]">
                Personal Photo Memory Quiz
              </span>
              <h2 className="text-2xl font-extrabold text-[#0F172A] mt-2">
                {currentQ.title}
              </h2>
            </div>
            <div className="text-right text-xs font-bold text-[#0284C7]">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Photo Display */}
          <div className="w-full h-64 sm:h-80 bg-black overflow-hidden rounded-2xl border border-[#E2E8F0] relative">
            <img src={currentQ.imageUrl} alt={currentQ.title} className="w-full h-full object-cover" />
          </div>

          {/* Question Text & Voice Prompt */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-[#0F172A] leading-snug">
              {currentQ.question}
            </h3>
            <button
              onClick={handleSpeakQuestion}
              className="p-3 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl cursor-pointer shrink-0 transition-all shadow-xs"
              title="Listen to question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctOptionIndex;

              let btnStyle = 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F0F9FF] hover:border-[#0284C7]';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-[#0284C7] border-[#0284C7] text-white font-bold shadow-xs';
                } else if (isSelected) {
                  btnStyle = 'bg-red-50 border-red-300 text-red-900';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between text-sm font-semibold ${btnStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white border border-[#CBD5E1] text-[#0284C7] text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </span>
                  {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Session'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Game Over Score Screen */
        <div className="py-8 text-center space-y-6">
          <Award className="w-16 h-16 text-[#0284C7] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-[#0F172A]">
              Memory Session Complete
            </h3>
            <p className="text-xs text-[#64748B] font-medium">
              Your results have been recorded into your cognitive progress trajectory.
            </p>
          </div>

          <div className="bg-[#F0F9FF] border border-[#BAE6FD] p-6 max-w-sm mx-auto rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
              Memory Performance Score
            </span>
            <div className="text-5xl font-extrabold text-[#0F172A]">
              {finalScore}%
            </div>
            <p className="text-xs font-bold text-[#0284C7]">
              {correctCount} of {questions.length} Questions Answered Correctly
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-[#0284C7]" />
              Play Again
            </button>

            {onFinish && (
              <button
                onClick={onFinish}
                className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
