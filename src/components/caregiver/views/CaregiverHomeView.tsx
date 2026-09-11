import React from 'react';
import { 
  Plus, 
  Pill, 
  BellRing,
  FileText, 
  Users, 
  ChevronRight, 
  Check, 
  Gamepad2, 
  BarChart3, 
  Leaf
} from 'lucide-react';
import type { PatientProfile, PatientReminder, GameResult } from '../../../types';

interface Props {
  caregiverName: string;
  primaryPatient: PatientProfile | null;
  reminders: PatientReminder[];
  gameResults: GameResult[];
  onOpenLogActivity: () => void;
  onOpenAddMedication: () => void;
  onOpenAddNote: () => void;
  onOpenManagePatient: () => void;
  onViewPatientDetail: (patientId: string) => void;
  onViewReports: () => void;
  onViewAllActivities: () => void;
}

export const CaregiverHomeView: React.FC<Props> = ({
  caregiverName = 'Rahul',
  primaryPatient,
  reminders = [],
  gameResults = [],
  onOpenLogActivity,
  onOpenAddMedication,
  onOpenAddNote,
  onOpenManagePatient,
  onViewPatientDetail,
  onViewReports,
  onViewAllActivities
}) => {
  // Use real primary patient or handle null gracefully
  const patientName = primaryPatient?.name || 'No Patient Paired';
  const patientAge = primaryPatient?.age;
  const patientLiving = primaryPatient?.state ? `Living in ${primaryPatient.state}` : primaryPatient ? 'Living with family' : 'Pair patient to start monitoring';

  return (
    <div className="space-y-6 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3">
      
      {/* Caregiver Greeting & Inspiring Quote */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-slate-500 block">
            Good Morning,
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {caregiverName}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Together, you make a difference.
          </p>
        </div>

        {/* Quote Pill */}
        <div className="bg-[#ECFDF5] border border-[#A7F3D0]/60 p-3 rounded-2xl flex items-start gap-2.5 max-w-[170px] shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] font-bold text-[#047857] leading-tight italic">
            “Care builds brighter tomorrows.”
          </p>
        </div>
      </div>

      {/* Primary Patient Status Card */}
      <div 
        onClick={() => primaryPatient ? onViewPatientDetail(primaryPatient.patientId || primaryPatient.id) : onOpenManagePatient()}
        className="bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-3xl shadow-sm transition-all flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-100 via-teal-50 to-emerald-200 shadow-xs shrink-0 flex items-center justify-center">
            {primaryPatient?.avatarUrl ? (
              <img src={primaryPatient.avatarUrl} alt={patientName} className="w-full h-full rounded-full object-cover" />
            ) : primaryPatient ? (
              <span className="text-2xl font-black text-emerald-700 uppercase select-none">
                {patientName.charAt(0)}
              </span>
            ) : (
              <Plus className="w-6 h-6 text-emerald-600" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
              {patientName}
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              {patientAge ? `Age ${patientAge} | ${patientLiving}` : patientLiving}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {primaryPatient ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Stable
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    View Profile
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-extrabold text-blue-600">
                  Tap to pair with patient ID →
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
      </div>

      {/* Action Grid: What would you like to do? */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-4 gap-2.5">
          {/* Tile 1: Log Activity */}
          <button
            onClick={onOpenLogActivity}
            className="bg-white border border-slate-100 hover:border-blue-200 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all hover:shadow-xs cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Log Activity
            </span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5 leading-none">
              E.g. walk, meal
            </span>
          </button>

          {/* Tile 2: Add Reminder */}
          <button
            onClick={onOpenAddMedication}
            className="bg-white border border-slate-100 hover:border-emerald-200 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all hover:shadow-xs cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BellRing className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Add Reminder
            </span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5 leading-none">
              Set reminder / alarm
            </span>
          </button>

          {/* Tile 3: Add Note */}
          <button
            onClick={onOpenAddNote}
            className="bg-white border border-slate-100 hover:border-purple-200 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all hover:shadow-xs cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-[#8B5CF6] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Add Note
            </span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5 leading-none">
              Observation, mood
            </span>
          </button>

          {/* Tile 4: Manage Patient */}
          <button
            onClick={onOpenManagePatient}
            className="bg-white border border-slate-100 hover:border-amber-200 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all hover:shadow-xs cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Manage Patient
            </span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5 leading-none">
              Edit details, settings
            </span>
          </button>
        </div>
      </div>

      {/* Section: Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Recent Activity
          </h2>
          <button
            onClick={onViewAllActivities}
            className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Activity List Container */}
        <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-2xs divide-y divide-slate-50">
          {reminders.length === 0 && gameResults.length === 0 ? (
            <div className="p-6 text-center space-y-1">
              <p className="text-xs font-extrabold text-slate-800">No Recent Activity</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Live activities will display here when your paired patient completes reminders or memory games.
              </p>
            </div>
          ) : (
            <>
              {reminders.map((rem) => (
                <div key={rem.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${rem.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0`}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {rem.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {rem.time || 'Today'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${rem.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {rem.completed ? <Check className="w-3 h-3" /> : null} {rem.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}

              {gameResults.map((res, i) => (
                <div key={res.id || i} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 capitalize">
                        Completed {res.gameCategory || 'Memory'} Test
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Score: {res.score}% • {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                    <Check className="w-3 h-3" /> Passed
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Banner: View Detailed Reports */}
      <div
        onClick={onViewReports}
        className="bg-[#F0F9FF] border border-[#E0F2FE] hover:border-blue-300 p-4 rounded-3xl shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              View Detailed Reports
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Activity history, mood trends, health data
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
      </div>

    </div>
  );
};
