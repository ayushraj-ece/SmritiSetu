import React, { useState } from 'react';
import { X, Pill } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { alarmAudioService } from '../../../services/alarmAudioService';

interface Props {
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddMedicationModal: React.FC<Props> = ({
  patientId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [medicineName, setMedicineName] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [repeatPattern, setRepeatPattern] = useState<'Daily' | 'Weekly' | 'Once'>('Daily');
  const [soundOption, setSoundOption] = useState<'Gentle Chime' | 'Voice Alarm' | 'Loud Alarm'>('Gentle Chime');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (patientId) {
        await dataService.addReminder({
          id: `med_${Date.now()}`,
          patientId,
          type: 'medicine',
          title: `Take ${medicineName || 'Morning Medicine'}`,
          time,
          repeatPattern,
          soundOption,
          completed: false
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add medication:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Add Medication</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Medicine Name & Dosage</label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="E.g. Amlodipine 5mg (Morning Medicine)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Scheduled Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Repeat Pattern</label>
              <select
                value={repeatPattern}
                onChange={(e) => setRepeatPattern(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">Alarm Sound</label>
              <button
                type="button"
                onClick={() => alarmAudioService.playAlarmRing(2)}
                className="text-[10px] font-extrabold text-emerald-600 hover:underline"
              >
                🔊 Test Sound
              </button>
            </div>
            <select
              value={soundOption}
              onChange={(e) => setSoundOption(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
            >
              <option value="Gentle Chime">Gentle Chime</option>
              <option value="Voice Alarm">Voice Alarm</option>
              <option value="Loud Alarm">Loud Alarm</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
            >
              {loading ? 'Scheduling...' : 'Set Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
