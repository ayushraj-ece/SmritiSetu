import React, { useState } from 'react';
import { AlertTriangle, X, UserMinus, ShieldAlert } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { auth } from '../../../services/firebase';

interface Props {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnpairConfirmModal: React.FC<Props> = ({
  isOpen,
  patientId,
  patientName,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUnpair = async () => {
    setLoading(true);
    try {
      const caregiverUid = auth.currentUser?.uid || 'caregiver_user';
      await dataService.unpairPatient(patientId, caregiverUid);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to unpair patient:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900 leading-tight">
            Unpair Patient?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to unpair from <strong className="text-slate-900 font-bold">{patientName}</strong> (<span className="font-mono text-blue-600 font-bold">{patientId}</span>)?
          </p>
          <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3 text-[11px] text-red-800 font-semibold leading-normal mt-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>You will lose real-time access to their daily reminders, cognitive stats, and emergency alerts until paired again.</span>
          </div>
        </div>

        {/* Action Buttons: Yes / No */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUnpair}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <UserMinus className="w-4 h-4" />
            <span>{loading ? 'Unpairing...' : 'Yes, Unpair'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
