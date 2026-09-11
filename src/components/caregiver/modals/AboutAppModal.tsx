import React from 'react';
import { X, Info, Heart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">About Smritisetu</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 shadow-md mx-auto flex items-center justify-center text-white">
            <Heart className="w-8 h-8 fill-current" />
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 leading-tight">স্মৃতিসেতু (Smritisetu)</h4>
            <span className="text-xs font-semibold text-slate-500 block">Care Together • Version 1.0.0</span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
            Smritisetu is a real-time cognitive monitoring, dementia care, and caregiver support platform tailored for North Eastern India. Connecting patients, caregivers, and doctors in real time.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
