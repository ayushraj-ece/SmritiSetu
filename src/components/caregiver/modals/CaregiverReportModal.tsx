import React from 'react';
import { X, Printer, Brain, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';
import type { PatientProfile, GameResult, PatientReminder } from '../../../types';
import { adaptiveEngine } from '../../../ai/adaptiveEngine';

interface Props {
  patient?: PatientProfile | null;
  patientName?: string;
  patientId?: string;
  gameResults?: GameResult[];
  reminders?: PatientReminder[];
  isOpen: boolean;
  onClose: () => void;
}

export const CaregiverReportModal: React.FC<Props> = ({
  patient,
  patientName: propPatientName,
  patientId: propPatientId,
  gameResults = [],
  reminders = [],
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const indices = adaptiveEngine.calculateCognitiveIndices(gameResults);
  const overallScore = Math.round((indices.mri + indices.apsi + indices.pre + indices.era) / 4);

  const completedReminders = reminders.filter(r => r.completed).length;
  const totalReminders = reminders.length;
  const displayName = propPatientName || patient?.name || 'Patient';
  const displayId = propPatientId || patient?.patientId || 'ASM58291';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Clinical Patient Report</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Smritisetu Longitudinal Care Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print PDF</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Profile Header */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-slate-900 text-sm block">
              {displayName}
            </span>
            <span className="text-slate-500 font-medium">
              ID: <span className="font-mono font-bold text-blue-600">{displayId}</span> • Age {patient?.age || 78} • {patient?.state || 'Assam'}
            </span>
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
            Active Real-Time Monitoring
          </span>
        </div>

        {/* Cognitive Index Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-100 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Overall Cognitive Index
            </span>
            <span className="text-2xl font-black text-slate-900 block">{overallScore}%</span>
            <span className="text-[10px] text-slate-500 font-semibold block">4 Domain Weighted Average</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              Task Completion Rate
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">{completedReminders} of {totalReminders} Tasks Done</span>
          </div>
        </div>

        {/* Domain Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Cognitive Domain Metrics
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" /> Memory & Recall (MRI)
              </span>
              <span className="font-black text-purple-700">{indices.mri}%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Focus & Attention (APSI)
              </span>
              <span className="font-black text-blue-700">{indices.apsi}%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" /> Pattern Recognition (PRE)
              </span>
              <span className="font-black text-pink-700">{indices.pre}%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Executive Routine (ERA)
              </span>
              <span className="font-black text-emerald-700">{indices.era}%</span>
            </div>
          </div>
        </div>

        {/* Clinical Note Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>Generated via SmritiSetu Engine</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>

      </div>
    </div>
  );
};
