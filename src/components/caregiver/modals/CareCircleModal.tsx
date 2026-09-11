import React from 'react';
import { X, Users, ShieldCheck, Plus } from 'lucide-react';
import type { PatientProfile } from '../../../types';

interface Props {
  patients?: PatientProfile[];
  isOpen: boolean;
  onClose: () => void;
  onOpenAddPatient?: () => void;
}

export const CareCircleModal: React.FC<Props> = ({
  patients = [],
  isOpen,
  onClose,
  onOpenAddPatient
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Care Circle</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Manage linked family members and shared caregiver access for your registered patients.
        </p>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Paired Patients ({patients.length})
          </span>

          {patients.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2 border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-600">No patients linked to your Care Circle</p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAddPatient) onOpenAddPatient();
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Patient</span>
              </button>
            </div>
          ) : (
            patients.map((p, idx) => (
              <div key={p.id || idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {p.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{p.name}</h4>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">{p.patientId}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
