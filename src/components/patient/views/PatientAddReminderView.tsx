import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Pill, 
  Droplet, 
  Footprints, 
  Utensils, 
  Calendar, 
  MoreHorizontal, 
  Clock, 
  Repeat, 
  Bell, 
  Type,
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import { alarmAudioService } from '../../../services/alarmAudioService';
import type { PatientReminder, ReminderType } from '../../../types';

interface Props {
  onBack: () => void;
  onSave: (reminder: PatientReminder) => void;
  patientId: string;
}

export const PatientAddReminderView: React.FC<Props> = ({
  onBack,
  onSave,
  patientId
}) => {
  const [selectedType, setSelectedType] = useState<string>('medicine');
  const [title, setTitle] = useState<string>('');
  const [time, setTime] = useState<string>('08:00 AM');
  const [repeat, setRepeat] = useState<'Daily' | 'Weekly' | 'Once'>('Daily');
  const [sound, setSound] = useState<'Gentle Chime' | 'Voice Alarm' | 'Loud Alarm'>('Gentle Chime');

  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState<boolean>(false);
  const [showSoundPicker, setShowSoundPicker] = useState<boolean>(false);

  const categories = [
    { type: 'medicine', label: 'Medicine', icon: <Pill className="w-6 h-6 text-pink-500" /> },
    { type: 'hydration', label: 'Water', icon: <Droplet className="w-6 h-6 text-blue-500" /> },
    { type: 'activity', label: 'Activity', icon: <Footprints className="w-6 h-6 text-emerald-500" /> },
    { type: 'appointment', label: 'Meal', icon: <Utensils className="w-6 h-6 text-amber-500" /> },
    { type: 'custom', label: 'Appointment', icon: <Calendar className="w-6 h-6 text-purple-500" /> },
    { type: 'custom_other', label: 'Custom', icon: <MoreHorizontal className="w-6 h-6 text-slate-400" /> }
  ];

  const handleTestSound = () => {
    alarmAudioService.playAlarmRing(2);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (selectedType === 'medicine' ? 'Take Morning Medicine' : 'Daily Reminder');

    const validReminderType: ReminderType = 
      (selectedType === 'medicine' || selectedType === 'hydration' || selectedType === 'activity' || selectedType === 'appointment') 
        ? selectedType 
        : 'medicine';

    const newReminder: PatientReminder = {
      id: `rem_${Date.now()}`,
      patientId,
      type: validReminderType,
      title: finalTitle,
      time: time,
      repeatPattern: repeat,
      soundOption: sound,
      completed: false,
      synced: false
    };

    onSave(newReminder);
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-in fade-in duration-300 px-4 sm:px-0">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer shadow-xs transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-extrabold text-slate-900">
          Add Reminder
        </h1>

        <div className="w-9 h-9" />
      </div>

      {/* Hero Card */}
      <div className="bg-[#FFF7ED] border border-[#FFEDD5] p-6 rounded-3xl shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shrink-0 shadow-xs">
          <Pill className="w-8 h-8 text-pink-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900 leading-snug">
            What would you like to be reminded about?
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Choose a type or create your own
          </p>
        </div>
      </div>

      {/* Category Grid (2x3) */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedType === cat.type;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedType(cat.type)}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                isSelected
                  ? 'bg-[#F0FDF4] border-[#1E7F53] shadow-xs'
                  : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-2xs">
                {cat.icon}
              </div>
              <span className={`text-xs font-bold ${isSelected ? 'text-[#1E7F53]' : 'text-slate-700'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section: Reminder Details Form (Matching Image 1) */}
      <form onSubmit={handleSave} className="space-y-4 pt-2">
        <h3 className="text-base font-extrabold text-slate-900">
          Reminder Details
        </h3>

        {/* Title Input */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center gap-3 focus-within:border-[#0284C7] transition-all">
          <Type className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take blood pressure medicine"
            className="w-full text-xs font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Time Selector */}
        <div className="space-y-2">
          <div
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-900">Time</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-[#0284C7]">
              <span>{time}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {showTimePicker && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-wrap gap-2 animate-in fade-in duration-200">
              {['07:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '02:00 PM', '06:00 PM', '08:00 PM', '09:00 PM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTime(t); setShowTimePicker(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    time === t ? 'bg-[#0284C7] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Repeat Selector */}
        <div className="space-y-2">
          <div
            onClick={() => setShowRepeatPicker(!showRepeatPicker)}
            className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-900">Repeat</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-[#0284C7]">
              <span>{repeat}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {showRepeatPicker && (
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-2xl flex gap-2 animate-in fade-in duration-200">
              {(['Daily', 'Weekly', 'Once'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRepeat(r); setShowRepeatPicker(false); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    repeat === r ? 'bg-[#0284C7] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Sound Selector */}
        <div className="space-y-2">
          <div
            onClick={() => setShowSoundPicker(!showSoundPicker)}
            className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-900">Notification Sound</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#0284C7]">
              <span>{sound}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleTestSound(); }}
                className="p-1 rounded-lg bg-sky-50 text-[#0284C7] hover:bg-sky-100 transition-all"
                title="Test audio chime"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {showSoundPicker && (
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-2xl flex flex-col gap-1.5 animate-in fade-in duration-200">
              {(['Gentle Chime', 'Voice Alarm', 'Loud Alarm'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSound(s); setShowSoundPicker(false); handleTestSound(); }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                    sound === s ? 'bg-[#0284C7] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{s}</span>
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Action Button */}
        <button
          type="submit"
          className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all transform active:scale-98 mt-6"
        >
          <span>Save Reminder</span>
        </button>
      </form>

      {/* Quote Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border border-sky-100 p-4 rounded-2xl text-center">
        <p className="text-xs font-bold text-[#0284C7] italic flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>You're taking a positive step! 💙</span>
        </p>
      </div>

    </div>
  );
};

