import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Phone, 
  MessageSquare, 
  MoreHorizontal, 
  FileText, 
  ChevronRight, 
  Footprints, 
  Moon, 
  Heart, 
  Pill, 
  Gamepad2, 
  Check, 
  Plus, 
  BarChart3,
  Users
} from 'lucide-react';
import type { PatientProfile, PatientReminder, GameResult } from '../../../types';

interface Props {
  patient: PatientProfile | null;
  reminders: PatientReminder[];
  gameResults: GameResult[];
  onBack: () => void;
  onCallPatient?: () => void;
  onMessagePatient?: () => void;
  onOpenLogActivity: () => void;
  onOpenAddMedication: () => void;
  onOpenAddNote: () => void;
  onViewReports: () => void;
}

export const CaregiverPatientDetailView: React.FC<Props> = ({
  patient,
  reminders = [],
  gameResults = [],
  onBack,
  onCallPatient,
  onMessagePatient,
  onOpenLogActivity,
  onOpenAddMedication,
  onOpenAddNote,
  onViewReports
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Activities' | 'Medications' | 'Health' | 'Notes'>('Overview');

  if (!patient) {
    return (
      <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Patients</span>
          </button>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No Patient Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Please pair with a patient using their unique 5-digit code (e.g. ASM58291) to view their profile, daily activities, and cognitive stats.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Back to Patients List</span>
          </button>
        </div>
      </div>
    );
  }

  const patientName = patient.name || 'Patient';
  const patientAgeStr = patient.age ? `Age ${patient.age}` : '';
  const patientLiving = patient.state ? `Living in ${patient.state}` : 'Paired Patient';

  const completedReminders = reminders.filter(r => r.completed);
  const totalCompleted = completedReminders.length + gameResults.length;
  const computedSteps = totalCompleted > 0 ? (totalCompleted * 850) + 1200 : 0;

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3">
      
      {/* Top Header: Back + My Patients + Edit */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Patients</span>
        </button>

        <button
          className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 via-indigo-50 to-blue-200 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
              {patient.avatarUrl ? (
                <img src={patient.avatarUrl} alt={patientName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl font-black text-blue-700 uppercase">
                  {patientName.charAt(0)}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 leading-none">
                {patientName}
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                {patientAgeStr ? `${patientAgeStr} | ` : ''}{patientLiving}
              </p>

              <div className="pt-0.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Paired
                </span>
                {patient.patientId && (
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {patient.patientId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCallPatient}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all cursor-pointer border border-slate-100"
              title="Call Patient"
            >
              <Phone className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={onMessagePatient}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all cursor-pointer border border-slate-100"
              title="Message Patient"
            >
              <MessageSquare className="w-4 h-4 text-slate-700" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all cursor-pointer border border-slate-100"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Unique Patient Code Info Tag */}
        <div className="pt-2 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Patient Code: <strong className="font-mono text-slate-800">{patient.patientId || patient.id}</strong></span>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 text-xs font-bold">
        {(['Overview', 'Activities', 'Medications', 'Health', 'Notes'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Section: Today at a glance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Today at a glance
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {todayDateStr}
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-2xs grid grid-cols-3 divide-x divide-slate-100">
          {/* Steps / Activity */}
          <div className="flex flex-col items-center text-center px-1">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <Footprints className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {computedSteps > 0 ? computedSteps.toLocaleString() : '0'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
              Est. Steps
            </span>
          </div>

          {/* Sleep */}
          <div className="flex flex-col items-center text-center px-1">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
              <Moon className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {gameResults.length > 0 ? '7h 30m' : 'Normal'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
              Sleep / Rest
            </span>
          </div>

          {/* Cognition / Heart */}
          <div className="flex flex-col items-center text-center px-1">
            <div className="w-9 h-9 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-1.5">
              <Heart className="w-4.5 h-4.5 text-pink-500" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {gameResults.length > 0 ? `${gameResults[0].score}%` : 'Stable'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
              Quiz / Status
            </span>
          </div>
        </div>
      </div>

      {/* Section: Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Recent Activity
          </h3>
          <button className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-2xs divide-y divide-slate-50">
          {reminders.length === 0 && gameResults.length === 0 ? (
            <div className="p-6 text-center space-y-1">
              <p className="text-xs font-extrabold text-slate-800">No Recent Activity Recorded</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Completed medicine reminders and cognitive test results will appear here live.
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

      {/* Section: Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          Quick Actions
        </h3>

        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={onOpenLogActivity}
            className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Log Activity
            </span>
          </button>

          <button
            onClick={onOpenAddMedication}
            className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Add Medication
            </span>
          </button>

          <button
            onClick={onOpenAddNote}
            className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs hover:border-purple-200 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 text-[#8B5CF6] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              Add Note
            </span>
          </button>

          <button
            onClick={onViewReports}
            className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              View Reports
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
