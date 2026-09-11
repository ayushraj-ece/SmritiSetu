import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Heart, 
  Pill, 
  Gamepad2, 
  Check, 
  Plus, 
  BarChart3,
  Users,
  UserMinus,
  BellRing,
  Stethoscope
} from 'lucide-react';
import type { PatientProfile, PatientReminder, GameResult, PatientNote, Prescription } from '../../../types';
import { UnpairConfirmModal } from '../modals/UnpairConfirmModal';
import { auth } from '../../../services/firebase';

interface Props {
  patient: PatientProfile | null;
  reminders: PatientReminder[];
  gameResults: GameResult[];
  notes?: PatientNote[];
  prescriptions?: Prescription[];
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
  notes = [],
  prescriptions = [],
  onBack,
  onCallPatient,
  onMessagePatient,
  onOpenLogActivity,
  onOpenAddMedication,
  onOpenAddNote,
  onViewReports
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Activities' | 'Medications' | 'Health' | 'Notes'>('Overview');
  const [showUnpairModal, setShowUnpairModal] = useState(false);

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

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3">
      
      {/* Unpair Confirmation Modal */}
      <UnpairConfirmModal
        isOpen={showUnpairModal}
        patientId={patient.patientId || patient.id}
        patientName={patientName}
        onClose={() => setShowUnpairModal(false)}
        onSuccess={onBack}
      />

      {/* Top Header: Back + Set Alarm + Unpair */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Patients</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddMedication}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>+ Set Alarm</span>
          </button>

          <button
            onClick={() => setShowUnpairModal(true)}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all shadow-2xs"
            title="Unpair this patient"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Unpair</span>
          </button>
        </div>
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

      {/* Tabs Content */}
      {activeTab === 'Overview' && (
        <>
          {/* Section: Today at a glance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Today at a glance
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {todayDateStr}
                </span>
                <button
                  type="button"
                  onClick={onViewReports}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold rounded-xl transition-all cursor-pointer border border-blue-100 shadow-2xs"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>View All</span>
                </button>
              </div>
            </div>

            {/* 3 Real Metric Cards */}
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-2xs grid grid-cols-3 divide-x divide-slate-100">
              {/* Cognitive Tests Played */}
              <div className="flex flex-col items-center text-center px-1">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
                  <Gamepad2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-base font-black text-slate-900 leading-tight">
                  {gameResults.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  Tests Played
                </span>
              </div>

              {/* Meds Taken */}
              <div className="flex flex-col items-center text-center px-1">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <Pill className="w-4.5 h-4.5" />
                </div>
                <span className="text-base font-black text-slate-900 leading-tight">
                  {reminders.length > 0 ? `${reminders.filter(r => r.completed).length}/${reminders.length}` : '0/0'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  Meds Taken
                </span>
              </div>

              {/* Avg Accuracy */}
              <div className="flex flex-col items-center text-center px-1">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <span className="text-base font-black text-slate-900 leading-tight">
                  {gameResults.length > 0 
                    ? `${Math.round(gameResults.reduce((acc, g) => acc + (g.accuracyPercentage ?? g.score ?? 0), 0) / gameResults.length)}%` 
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  Avg Accuracy
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
              <button onClick={() => setActiveTab('Activities')} className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer">
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
                  <BellRing className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Set Alarm & Reminder
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
        </>
      )}

      {/* Tab: Activities */}
      {activeTab === 'Activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">All Patient Activities</h3>
            <button onClick={onOpenLogActivity} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Log Activity
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Cognitive Evaluations & Tests</h4>
            {gameResults.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2">No cognitive test results logged yet today.</p>
            ) : (
              <div className="space-y-2">
                {gameResults.map((g, i) => (
                  <div key={i} className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-extrabold text-purple-950 capitalize">{g.gameCategory} Game Test</h5>
                      <p className="text-[10px] font-semibold text-purple-700 mt-0.5">Accuracy: {g.accuracyPercentage}% • Time: {g.responseTimeSeconds}s</p>
                    </div>
                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-xl">
                      Score: {g.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Medications */}
      {activeTab === 'Medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Doctor Prescriptions & Alarms</h3>
            <button onClick={onOpenAddMedication} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
              <BellRing className="w-3.5 h-3.5" />
              <span>Set Alarm & Reminder</span>
            </button>
          </div>

          {/* Structured Doctor Prescriptions Table UI */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> OFFICIAL DOCTOR PRESCRIPTION SCHEDULE
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Doctor Controlled
              </span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">No Prescriptions Issued Yet</p>
                <p className="text-[11px] text-slate-400 font-normal">
                  When the doctor issues a prescription in the Doctor Portal, it will appear here in a structured schedule table.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-medium uppercase text-slate-400">
                      <th className="py-2.5 px-3">Medicine & Dosage</th>
                      <th className="py-2.5 px-3 text-center">Time</th>
                      <th className="py-2.5 px-3 text-center">Days</th>
                      <th className="py-2.5 px-3">Instructions</th>
                      <th className="py-2.5 px-3 text-right">Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-normal text-slate-700">
                    {prescriptions.map((rx) => {
                      const daysText = (!rx.daysOfWeek || rx.daysOfWeek.length === 7 || rx.daysOfWeek.includes('Daily'))
                        ? 'Daily'
                        : rx.daysOfWeek.join(', ');
                      
                      const docParts = rx.prescribedBy ? rx.prescribedBy.split('•') : [];
                      const doctorNameClean = docParts.length > 0 ? docParts[0].trim() : (rx.prescribedBy || 'Dr. R. K. Sharma');
                      const hospitalClean = docParts.length > 1 ? docParts[1].trim() : (rx.hospitalName || '');

                      return (
                        <tr key={rx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-900 block">{rx.medicineName}</span>
                            <span className="text-[11px] text-emerald-600 font-normal block">{rx.dosage}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50/70 text-blue-700 font-normal rounded-md border border-blue-100 text-xs">
                              {rx.time}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-xs font-normal text-slate-600">
                            {daysText}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600 font-normal">
                            {rx.instructions || 'Take after food'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-xs font-medium text-slate-800 block">{doctorNameClean}</span>
                            {hospitalClean && (
                              <span className="text-[11px] text-slate-400 font-normal block">{hospitalClean}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Daily Reminders List */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Patient Alarms & Timers</h4>
            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2">No active alarms configured for this patient.</p>
            ) : (
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${r.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center`}>
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900">{r.title}</h5>
                        <p className="text-[10px] font-semibold text-slate-400">{r.time} • {r.repeatPattern || 'Daily'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${r.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.completed ? 'Taken ✓' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Tab: Health */}
      {activeTab === 'Health' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Medical Conditions & Doctor Linkage</h3>

          {/* 1. Known Medical Conditions (Filled up by Doctor) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">KNOWN MEDICAL CONDITIONS</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {patient.medicalConditions || patient.knownConditions || 'No specific medical conditions logged yet.'}
                </p>
                <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">
                  {patient.doctorId ? '✓ Logged & verified by linked doctor' : 'Filled by doctor from Doctor Portal once linked'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Attending Doctor & Hospital (Dynamic linked state) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl ${patient.doctorId ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ATTENDING CLINICAL DOCTOR</span>
                {patient.doctorId ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">
                      {patient.doctorName || 'Attending Physician'}
                    </p>
                    {patient.doctorHospital && (
                      <p className="text-[11px] text-slate-600 font-semibold">
                        {patient.doctorHospital}
                      </p>
                    )}
                    <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">
                      ✓ Active Authorized Doctor Linkage
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-amber-700">
                      No Doctor Linked
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Share Patient ID <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-blue-600">{patient.patientId || patient.id}</code> with your doctor so they can send an authorization pairing request from the Doctor Portal.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Emergency Contact (Caregiver details linked to patient) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">EMERGENCY CONTACT (PAIRED CAREGIVER)</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {(patient.caregiverName || auth.currentUser?.displayName || 'Primary Caregiver')} ({((patient.caregiverPhone || patient.emergencyContact || '+91 98765 43210').replace(/\s*\([^)]*\)/g, '').trim())}{(patient.caregiverRelation ? ` • ${patient.caregiverRelation}` : '')})
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">
                  ✓ Primary Caregiver Linked
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'Notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Caregiver & Doctor Notes</h3>
            <button onClick={onOpenAddNote} className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center space-y-3 shadow-2xs">
              <p className="text-xs font-bold text-slate-700">No Custom Notes Added Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Caregiver observations and clinical feedback sent by the attending doctor will appear live in this section.
              </p>
              <button onClick={onOpenAddNote} className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-all cursor-pointer inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Write First Note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const isDoctor = note.role === 'doctor' || note.title?.toLowerCase().includes('doctor');
                const dateStr = new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div 
                    key={note.id} 
                    className={`bg-white border rounded-3xl p-4 space-y-2 shadow-2xs transition-all ${
                      isDoctor ? 'border-blue-200 bg-blue-50/20' : 'border-purple-100 bg-purple-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isDoctor ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isDoctor ? <Stethoscope className="w-3 h-3 text-blue-600" /> : <FileText className="w-3 h-3 text-purple-600" />}
                        {isDoctor ? '🩺 Doctor Guidance & Suggestion' : note.title || 'Caregiver Note'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-semibold">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed pt-1">
                      "{note.body}"
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-100">
                      <span>Written by: <strong className="text-slate-700">{note.writtenBy || (isDoctor ? 'Dr. R. K. Sharma' : 'Caregiver')}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
