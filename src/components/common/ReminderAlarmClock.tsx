import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { voiceService } from '../../services/voiceService';
import { alarmAudioService } from '../../services/alarmAudioService';
import { dataService } from '../../services/dataService';
import type { PatientReminder } from '../../types';
import { BellRing, CheckCircle2, Volume2, X, AlertCircle } from 'lucide-react';

interface Props {
  patientId: string;
}

export const ReminderAlarmClock: React.FC<Props> = ({ patientId }) => {
  const { language } = useLanguage();
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<PatientReminder | null>(null);
  const [testAlarmTriggered, setTestAlarmTriggered] = useState<boolean>(false);
  const lastRungReminderId = useRef<string | null>(null);

  // Subscribe to real-time Firestore reminders
  useEffect(() => {
    if (!patientId) return;
    const unsub = dataService.subscribeReminders(patientId, (remList) => {
      setReminders(remList);
    });
    return () => unsub();
  }, [patientId]);

  // Helper to format current time in 12-hour AM/PM format (e.g. "09:00 AM")
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

    // Play real audio chime loop
    alarmAudioService.playAlarmRing(6);

    // Speak voice prompt out loud
    const text = language === 'as' && reminder.titleAssamese
      ? `মনত পেলাই দিছোঁ: ${reminder.titleAssamese}`
      : `Reminder alert! Time for: ${reminder.title}`;
    
    voiceService.speak(text, language);
  };

  // Monitor wall clock every second for matching reminders
  useEffect(() => {
    const interval = setInterval(() => {
      if (reminders.length === 0) return;
      const nowStr = getCurrentTimeString();
      const cleanNowStr = nowStr.toUpperCase().trim();

      const matching = reminders.find(r => {
        if (r.completed) return false;
        if (r.id === lastRungReminderId.current) return false;
        const timeUpper = (r.time || '').toUpperCase().trim();
        // Match exact or without leading zero
        return timeUpper === cleanNowStr || timeUpper === cleanNowStr.replace(/^0/, '');
      });

      if (matching) {
        triggerAlarm(matching);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, language]);

  const handleDismiss = () => {
    alarmAudioService.stopAlarmRing();
    setActiveAlarm(null);
    setTestAlarmTriggered(false);
  };

  const handleComplete = async () => {
    if (activeAlarm) {
      // 1. Mark complete in real-time Firestore database
      await dataService.toggleReminder(activeAlarm.id, true);

      // 2. Send real-time notification to caregiver
      await dataService.sendNotification({
        userId: patientId,
        patientId,
        title: 'Medication Taken ✓',
        message: `Patient completed reminder: "${activeAlarm.title}".`,
        type: 'medication_alert',
        timestamp: Date.now(),
        read: false
      });
    }
    alarmAudioService.stopAlarmRing();
    setActiveAlarm(null);
    setTestAlarmTriggered(false);
  };

  return (
    <>
      {/* Ringing Alarm Fullscreen Popup */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 space-y-6 text-center animate-in zoom-in-95 duration-200">
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 text-[#0284C7] rounded-full border-4 border-sky-50 shadow-inner animate-pulse">
              <BellRing className="w-10 h-10 text-[#0284C7]" />
            </div>

            <div>
              <div className="inline-block px-3.5 py-1 bg-sky-50 text-[#0284C7] text-xs font-extrabold rounded-full border border-sky-100 mb-2">
                ⏰ Real-Time Reminder Alert • {activeAlarm.time}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {language === 'as' && activeAlarm.titleAssamese ? activeAlarm.titleAssamese : activeAlarm.title}
              </h3>
              {testAlarmTriggered && (
                <p className="text-xs text-sky-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Alarm Ringing & Voice Synthesizer Active
                </p>
              )}
            </div>

            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-left flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[#0284C7] shrink-0" />
              <p className="text-xs text-sky-950 font-bold leading-relaxed">
                Voice prompt: "Reminder alert! Time for: {activeAlarm.title}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleComplete}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Task Done</span>
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
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
