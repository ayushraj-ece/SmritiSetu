import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Pill, Droplet, Sun, Utensils, Moon, Flame, Trash2, Lock } from 'lucide-react';
import type { PatientReminder, GameResult } from '../../../types';
import { calculateStreakDays } from '../../../utils/streakCalculator';

interface Props {
  reminders: PatientReminder[];
  gameResults?: GameResult[];
  onToggleReminder: (id: string, completed: boolean) => void;
  onDeleteReminder?: (id: string) => void;
  onOpenAddReminder: () => void;
}

export const PatientRemindersView: React.FC<Props> = ({
  reminders,
  gameResults = [],
  onToggleReminder,
  onDeleteReminder,
  onOpenAddReminder
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'Today' | 'This Week' | 'All'>('Today');
  const [reminderToDelete, setReminderToDelete] = useState<PatientReminder | null>(null);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  // Dynamic Real Streak Calculation
  const streakCount = calculateStreakDays(gameResults, reminders);

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medicine': return <Pill className="w-5 h-5" />;
      case 'hydration': return <Droplet className="w-5 h-5" />;
      case 'activity': return <Sun className="w-5 h-5" />;
      case 'appointment': return <Utensils className="w-5 h-5" />;
      default: return <Moon className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'medicine': return 'bg-pink-100 text-pink-600';
      case 'hydration': return 'bg-blue-100 text-blue-600';
      case 'activity': return 'bg-emerald-100 text-emerald-600';
      case 'appointment': return 'bg-amber-100 text-amber-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-in fade-in duration-300 px-4 sm:px-0 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            MINDCARE
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
            Reminders
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Small steps for a healthier, happier you
          </p>
        </div>

        <div className="bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold text-[#1E7F53] shadow-xs">
          <span>You're doing great! 💚</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['Today', 'This Week', 'All'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === filter
                ? 'bg-[#1E7F53] text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Section: Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            Today
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {todayStr}
          </span>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <p className="text-sm font-bold text-slate-600">No reminders scheduled</p>
              <p className="text-xs text-slate-400 font-medium">Tap the green + button below to add your first reminder.</p>
            </div>
          ) : (
            reminders.map((rem) => {
              const isProtected = rem.type === 'medicine' || (rem as any).createdByRole === 'doctor' || (rem as any).createdByRole === 'caregiver' || (rem as any).scheduledBy || (rem as any).prescribedBy;

              return (
                <div
                  key={rem.id}
                  className="bg-white border border-slate-100 hover:border-emerald-200 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between gap-4 group"
                >
                  <div 
                    onClick={() => onToggleReminder(rem.id, !rem.completed)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${getIconBg(rem.type)} shadow-xs shrink-0`}>
                      {getReminderIcon(rem.type)}
                    </div>

                    <div>
                      <h4 className={`text-sm font-extrabold ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {rem.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{rem.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleReminder(rem.id, !rem.completed)}
                      className="p-1 cursor-pointer transition-transform active:scale-90"
                      title={rem.completed ? "Mark incomplete" : "Mark completed"}
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 group-hover:text-emerald-400 shrink-0 transition-colors" />
                      )}
                    </button>

                    {isProtected ? (
                      <span className="p-1 text-slate-300" title="Protected: Prescribed by Doctor / Caregiver">
                        <Lock className="w-4 h-4 text-slate-300" />
                      </span>
                    ) : (
                      onDeleteReminder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReminderToDelete(rem);
                          }}
                          className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dynamic Streak Card */}
      <div className="bg-[#FFF7ED] border border-[#FFEDD5] p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-slate-900 block">
            {streakCount === 0 ? '0 Days Streak' : `${streakCount} Day${streakCount > 1 ? 's' : ''} Streak`}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {streakCount === 0 ? 'Complete your daily reminders to build your streak!' : 'Great job staying on track! 🔥'}
          </span>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      {reminderToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Delete Reminder?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{reminderToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReminderToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteReminder) onDeleteReminder(reminderToDelete.id);
                  setReminderToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Reminder Button */}
      <button
        onClick={onOpenAddReminder}
        className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Add New Reminder"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

    </div>
  );
};
