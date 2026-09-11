import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { voiceService } from '../../services/voiceService';
import { alarmAudioService } from '../../services/alarmAudioService';
import { offlineStorage } from '../../services/offlineStorage';
import type { PatientReminder } from '../../types';
import { BellRing, CheckCircle2, Volume2, X, AlertCircle } from 'lucide-react';

interface Props {
  patientId: string;
}

export const ReminderAlarmClock: React.FC<Props> = ({ patientId }) => {
  const { language } = useLanguage();
  const [activeAlarm, setActiveAlarm] = useState<PatientReminder | null>(null);
  const [testAlarmTriggered, setTestAlarmTriggered] = useState<boolean>(false);
  const lastRungReminderId = useRef<string | null>(null);

  // Helper to format current time as "09:00 AM" or "11:30 AM"
  const getCurrentTimeString = (): string => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  const triggerAlarm = (reminder: PatientReminder) => {
    setActiveAlarm(reminder);
    lastRungReminderId.current = reminder.id;

    // Play chime sound
    alarmAudioService.playAlarmRing(4);

    // Speak voice prompt
    const text = language === 'as' && reminder.titleAssamese
      ? `মনত পেলাই দিছোঁ: ${reminder.titleAssamese}`
      : `Reminder alert! Time for: ${reminder.title}`;
    
    voiceService.speak(text, language);
  };

  // Monitor wall clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = getCurrentTimeString();
      const reminders: PatientReminder[] = offlineStorage.getReminders(patientId);

      const matching = reminders.find(
        r => !r.completed && r.time.trim() === nowStr && r.id !== lastRungReminderId.current
      );

      if (matching) {
        triggerAlarm(matching);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [patientId, language]);

  const handleDismiss = () => {
    setActiveAlarm(null);
    setTestAlarmTriggered(false);
  };

  const handleComplete = () => {
    if (activeAlarm) {
      offlineStorage.toggleReminderCompleted(activeAlarm.id, true);
    }
    setActiveAlarm(null);
    setTestAlarmTriggered(false);
  };

  return (
    <>
      {/* Real-Time Background Alarm Monitor (no floating button overlay) */}

      {/* Ringing Alarm Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 space-y-6 text-center">
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 text-[#0284C7] rounded-full border-4 border-sky-50 shadow-inner animate-pulse">
              <BellRing className="w-10 h-10 text-[#0284C7]" />
            </div>

            <div>
              <div className="inline-block px-3.5 py-1 bg-sky-50 text-[#0284C7] text-xs font-bold rounded-full border border-sky-100 mb-2">
                ⏰ Real-Time Reminder Alert • {activeAlarm.time}
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {language === 'as' && activeAlarm.titleAssamese ? activeAlarm.titleAssamese : activeAlarm.title}
              </h3>
              {testAlarmTriggered && (
                <p className="text-xs text-sky-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Demo Alarm Ringing & Voice Synthesizer Active
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[#0284C7] shrink-0" />
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Offline voice prompt spoken out loud in {language === 'as' ? 'Assamese (অসমীয়া)' : 'English'}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleComplete}
                className="flex-1 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Task Done</span>
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
