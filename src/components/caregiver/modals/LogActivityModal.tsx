import React, { useState } from 'react';
import { X, Footprints } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { auth } from '../../../services/firebase';

interface Props {
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LogActivityModal: React.FC<Props> = ({ patientId, isOpen, onClose, onSuccess }) => {
  const [activityType, setActivityType] = useState<'walk' | 'meal' | 'other'>('walk');
  const [title, setTitle] = useState('Went for a Walk');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const TYPES = [
    { type: 'walk', label: 'Walk', defaultTitle: 'Went for a Walk' },
    { type: 'meal', label: 'Meal', defaultTitle: 'Ate Healthy Meal' },
    { type: 'other', label: 'Other', defaultTitle: 'General Activity' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    try {
      const caregiverName = auth.currentUser?.displayName || 'Caregiver';
      await dataService.logActivity(patientId, {
        type: activityType,
        title: title || 'Activity',
        notes,
        loggedBy: caregiverName
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to log activity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Log Activity</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(item => (
                <button key={item.type} type="button"
                  onClick={() => { setActivityType(item.type as any); setTitle(item.defaultTitle); }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    activityType === item.type ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="E.g. Went for a Walk"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Notes (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 h-16 resize-none" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !patientId}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
