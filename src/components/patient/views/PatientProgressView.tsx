import React from 'react';
import { ArrowLeft, Brain, Target, Sparkles, CheckCircle2, Flame, Award, ChevronRight, Activity } from 'lucide-react';
import type { GameResult, PatientReminder } from '../../../types';
import { adaptiveEngine } from '../../../ai/adaptiveEngine';
import { calculateStreakDays } from '../../../utils/streakCalculator';

interface Props {
  gameResults: GameResult[];
  reminders: PatientReminder[];
  onBack: () => void;
  onNavigateToGames?: () => void;
}

export const PatientProgressView: React.FC<Props> = ({
  gameResults,
  reminders,
  onBack,
  onNavigateToGames
}) => {
  // Calculate real cognitive indices from live gameResults
  const indices = adaptiveEngine.calculateCognitiveIndices(gameResults);

  // True Overall Score across all 4 cognitive domains (Memory, Focus, Pattern, Routine)
  // Each domain contributes 25% to the overall cognitive health score
  const totalGames = gameResults.length;
  const completedReminders = reminders.filter(r => r.completed).length;
  const totalReminders = reminders.length;
  const streakCount = calculateStreakDays(gameResults, reminders);

  const overallScore = Math.round((indices.mri + indices.apsi + indices.pre + indices.era) / 4);

  // Breakdown by domain
  const domains = [
    {
      id: 'memory',
      title: 'Memory & Recall',
      subtitle: 'Short term memory & object retention',
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      score: indices.mri,
      plays: gameResults.filter(g => g.gameCategory === 'memory').length,
      color: '#8B5CF6'
    },
    {
      id: 'attention',
      title: 'Focus & Attention',
      subtitle: 'Reaction speed & concentration',
      icon: <Target className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
      score: indices.apsi,
      plays: gameResults.filter(g => g.gameCategory === 'attention').length,
      color: '#3B82F6'
    },
    {
      id: 'pattern',
      title: 'Pattern Recognition',
      subtitle: 'Visual ordering & problem solving',
      icon: <Sparkles className="w-5 h-5 text-pink-600" />,
      iconBg: 'bg-pink-100',
      score: indices.pre,
      plays: gameResults.filter(g => g.gameCategory === 'pattern').length,
      color: '#EC4899'
    },
    {
      id: 'routine',
      title: 'Daily Routines & Tasks',
      subtitle: 'Sequence tracking & reminder discipline',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      score: indices.era,
      plays: gameResults.filter(g => g.gameCategory === 'routine').length,
      color: '#10B981'
    }
  ];

  // Helper for status badge
  const getStatusBadge = (score: number, plays: number) => {
    if (plays === 0) return { label: 'No Data Yet', bg: 'bg-slate-100 text-slate-500' };
    if (score >= 80) return { label: 'Excellent 🌟', bg: 'bg-emerald-100 text-emerald-700' };
    if (score >= 60) return { label: 'Good Progress 👍', bg: 'bg-blue-100 text-blue-700' };
    return { label: 'Needs Practice 💪', bg: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-300 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-extrabold text-slate-900">
          Detailed Progress
        </h1>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
              REAL-TIME ANALYTICS
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              Cognitive Performance
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
            📊
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          {/* Circular Score Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white block leading-none">{overallScore}%</span>
              <span className="text-[10px] text-slate-300 font-bold block mt-0.5">Overall</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Games Completed</span>
              <span className="text-lg font-black text-white">{totalGames}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Tasks Completed</span>
              <span className="text-lg font-black text-white">{completedReminders} / {totalReminders}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10 col-span-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Daily Streak
              </span>
              <span className="text-sm font-black text-amber-300">{streakCount} Days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Category Breakdown */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Cognitive Domains
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Calculated Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {domains.map((dom) => {
            const status = getStatusBadge(dom.score, dom.plays);
            return (
              <div
                key={dom.id}
                className="bg-white border border-slate-100 hover:border-slate-300 p-4 rounded-2xl shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${dom.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                      {dom.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {dom.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-tight">
                        {dom.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">{dom.plays} Played</span>
                    <span className="font-extrabold text-slate-900">{dom.score}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dom.score}%`,
                        backgroundColor: dom.color
                      }}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${status.bg}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive AI Coach Recommendation */}
      <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 sm:p-5 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#1E7F53]">
          <Award className="w-5 h-5" />
          <h4 className="text-sm font-extrabold">Smart AI Adaptive Insight</h4>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {totalGames === 0 ? (
            "Welcome! Play your first mind game today to activate your real-time cognitive score tracking."
          ) : (
            `You have completed ${totalGames} mind exercise sessions! Regular daily practice helps strengthen neuronal memory pathways.`
          )}
        </p>
        {onNavigateToGames && (
          <button
            onClick={onNavigateToGames}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1E7F53] hover:underline pt-1 cursor-pointer"
          >
            <span>Play Mind Games Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recent Activity Log */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-extrabold text-slate-900">
          Recent Activity Timeline
        </h3>

        {gameResults.length === 0 && reminders.filter(r => r.completed).length === 0 ? (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No activity recorded yet</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Complete games or daily reminders to see your live timeline here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {gameResults.slice(0, 5).map((res, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block capitalize">
                      {res.gameCategory} Mind Game
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Level {res.difficultyLevel || 1}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-emerald-600 block">{res.score} pts</span>
                  <span className="text-[10px] text-slate-400 font-bold">{res.accuracyPercentage}% Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
