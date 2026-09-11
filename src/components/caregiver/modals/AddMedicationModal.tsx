import React, { useState } from 'react';
import { X, BellRing, Volume2, Clock } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { auth } from '../../../services/firebase';
import { alarmAudioService } from '../../../services/alarmAudioService';

interface Props {
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddMedicationModal: React.FC<Props> = ({ patientId, isOpen, onClose, onSuccess }) => {
  const [medicineName, setMedicineName] = useState('');
  
  // Click-to-select time states
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const [repeatPattern, setRepeatPattern] = useState<'Daily' | 'Weekly' | 'Once'>('Daily');
  const [soundOption, setSoundOption] = useState<'Gentle Chime' | 'Voice Alarm' | 'Loud Alarm'>('Gentle Chime');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    try {
      const scheduledBy = auth.currentUser?.displayName || 'Caregiver';
      const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      await dataService.addMedication(patientId, {
        name: medicineName,
        time: formattedTime,
        repeatPattern,
        soundOption,
        scheduledBy
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add medication:', err);
    } finally {
      setLoading(false);
    }
  };

  const formattedTimePreview = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">Set Patient Reminder & Alarm</h3>
              <p className="text-[11px] text-slate-400 font-medium">Will ring out loud on patient device</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Reminder / Alarm Title</label>
            <input type="text" value={medicineName} onChange={e => setMedicineName(e.target.value)}
              placeholder="E.g. Drink Water / Morning Walk / Evening Exercise / Check-up"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500" required />
          </div>

          {/* Click-to-Select Time Selection */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Select Alarm Time</span>
              </label>
              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                {formattedTimePreview}
              </span>
            </div>

            {/* Dropdowns for Hour, Minute, and AM/PM toggle */}
            <div className="flex items-center gap-2 pt-0.5">
              {/* Hour Selector */}
              <div className="flex-1">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                    <option key={h} value={h}>{h} hr</option>
                  ))}
                </select>
              </div>

              <span className="text-sm font-black text-slate-400">:</span>

              {/* Minute Selector */}
              <div className="flex-1">
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
              </div>

              {/* AM / PM Click Switcher */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('AM')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    selectedPeriod === 'AM'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('PM')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    selectedPeriod === 'PM'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {[
                { label: 'Morning (8 AM)', h: '08', m: '00', p: 'AM' },
                { label: 'Noon (12 PM)', h: '12', m: '00', p: 'PM' },
                { label: 'Evening (6 PM)', h: '06', m: '00', p: 'PM' },
                { label: 'Night (9 PM)', h: '09', m: '00', p: 'PM' },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedHour(preset.h);
                    setSelectedMinute(preset.m);
                    setSelectedPeriod(preset.p as 'AM' | 'PM');
                  }}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedHour === preset.h && selectedMinute === preset.m && selectedPeriod === preset.p
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-black'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Repeat Frequency</label>
              <select value={repeatPattern} onChange={e => setRepeatPattern(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Alarm Sound</label>
              </div>
              <select value={soundOption} onChange={e => setSoundOption(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                <option value="Gentle Chime">Gentle Chime</option>
                <option value="Voice Alarm">Voice Alarm</option>
                <option value="Loud Alarm">Loud Alarm</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-slate-500 font-semibold">Test Ringtone Sound:</span>
            <button type="button" onClick={() => alarmAudioService.playAlarmRing(2)}
              className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer">
              <Volume2 className="w-3.5 h-3.5" /> Play Test Ring
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !patientId}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all">
              <BellRing className="w-4 h-4" />
              <span>{loading ? 'Scheduling...' : 'Set Alarm & Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


