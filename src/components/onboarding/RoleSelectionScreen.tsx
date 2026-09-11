import React from 'react';
import { User, Users, Stethoscope, ChevronRight, Sparkles, Brain, ArrowLeft } from 'lucide-react';
import type { UserRole } from '../../types';

interface Props {
  onSelectRole: (role: UserRole) => void;
  onSelectDemo?: () => void;
  onBack?: () => void;
}

export const RoleSelectionScreen: React.FC<Props> = ({ onSelectRole, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 sm:p-8 animate-in fade-in duration-300 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0284C7]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 mb-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : <div />}

        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#38BDF8]" />
          <span className="text-lg font-black tracking-tight text-white">SmritiSetu</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto space-y-5 text-center">
        
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to SmritiSetu
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Select your role to sign in or create an account
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="space-y-3 pt-1">
          
          {/* Patient Role Card */}
          <div
            onClick={() => onSelectRole('patient')}
            className="p-5 bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-sky-400/80 rounded-3xl text-left transition-all transform hover:-translate-y-0.5 cursor-pointer group shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold shrink-0 border border-sky-500/30">
                <User className="w-6 h-6 text-sky-400" />
              </div>

              <div className="space-y-0.5 flex-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                  FOR PATIENTS
                </span>
                <h3 className="text-lg font-extrabold text-white group-hover:text-sky-300 transition-colors">
                  Patient Portal 🙋‍♂️
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-snug">
                  Brain training games, reminders & memory quiz.
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-sky-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Caregiver Role Card */}
          <div
            onClick={() => onSelectRole('caregiver')}
            className="p-5 bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-teal-400/80 rounded-3xl text-left transition-all transform hover:-translate-y-0.5 cursor-pointer group shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl font-bold shrink-0 border border-teal-500/30">
                <Users className="w-6 h-6 text-teal-400" />
              </div>

              <div className="space-y-0.5 flex-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
                  FOR CAREGIVERS & FAMILY
                </span>
                <h3 className="text-lg font-extrabold text-white group-hover:text-teal-300 transition-colors">
                  Caregiver Portal 🧑‍⚕️
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-snug">
                  Live cognitive tracking & reminder scheduling.
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-teal-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Doctor Role Card */}
          <div
            onClick={() => onSelectRole('doctor')}
            className="p-5 bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-indigo-400/80 rounded-3xl text-left transition-all transform hover:-translate-y-0.5 cursor-pointer group shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0 border border-indigo-500/30">
                <Stethoscope className="w-6 h-6 text-indigo-400" />
              </div>

              <div className="space-y-0.5 flex-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                  FOR HEALTHCARE PROFESSIONALS
                </span>
                <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                  Doctor Web Portal 🩺
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-snug">
                  Clinical cognitive reports & patient telemetry search.
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-indigo-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
