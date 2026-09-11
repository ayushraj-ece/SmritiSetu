import React from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AppGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { title: '1. Link Your Patient', desc: 'Ask your patient for their 5-digit ID (e.g. ASM58291) and enter it in Patients -> Add Patient.' },
    { title: '2. Monitor Live Activity', desc: 'View completed walks, games, and medicine intake in real time on the Home and Patient Detail views.' },
    { title: '3. Set Medication Alarms', desc: 'Use "Add Medication" to schedule alarms with voice alerts and gentle chimes.' },
    { title: '4. Real-Time Chat', desc: 'Use the Messages tab to text or exchange voice messages with your paired patient and doctors.' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Caregiver App Guide</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
              <span className="text-xs font-extrabold text-blue-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {step.title}
              </span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
