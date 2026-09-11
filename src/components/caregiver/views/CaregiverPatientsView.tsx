import React, { useState } from 'react';
import { Plus, Search, ChevronRight, Users, BellRing } from 'lucide-react';
import type { PatientProfile } from '../../../types';

interface Props {
  patients: PatientProfile[];
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onOpenCareCircle?: () => void;
  onOpenAddMedication?: (patientId: string) => void;
}

export const CaregiverPatientsView: React.FC<Props> = ({
  patients,
  onSelectPatient,
  onOpenAddPatient,
  onOpenCareCircle,
  onOpenAddMedication
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Needs Attention' | 'Archived'>('All');

  const filteredPatients = patients.filter(p => {
    const pid = p.patientId || p.id || '';
    if (pid.startsWith('SS-IND-') || pid.startsWith('MC-IND-') || pid.startsWith('SS-')) return false;
    return (
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pid.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3">
      
      {/* Top Header & Add Patient Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Patients
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            People you are caring for
          </p>
        </div>

        <button
          onClick={onOpenAddPatient}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-300 shadow-2xs transition-all"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: 'All', count: filteredPatients.length },
          { label: 'Active', count: filteredPatients.length },
          { label: 'Needs Attention', count: 0 },
          { label: 'Archived', count: 0 }
        ].map((filter) => {
          const isActive = activeFilter === filter.label;
          return (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs'
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          );
        })}
      </div>

      {/* Patient Cards List */}
      <div className="space-y-3 pt-1">
        {filteredPatients.length === 0 ? (
          <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">No Paired Patients</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Pair with your patient using their 5-digit ID (e.g. ASM58291) to monitor their cognitive health & activity in real-time.
              </p>
            </div>
            <button
              onClick={onOpenAddPatient}
              className="px-4 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Pair Patient Now</span>
            </button>
          </div>
        ) : (
          filteredPatients.map((patient, idx) => (
            <div
              key={patient.id || idx}
              onClick={() => patient.patientId && onSelectPatient(patient.patientId)}
              className="bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-3xl shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-100 via-indigo-50 to-blue-200 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
                  {patient.avatarUrl ? (
                    <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-blue-700 uppercase">
                      {patient.name?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                      {patient.name}
                    </h3>
                    {patient.patientId && (
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        {patient.patientId}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-400">
                    {patient.age ? `Age ${patient.age}` : ''} {patient.state ? `| ${patient.state}` : 'Paired Patient'}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Stable
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Real-time sync active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const pid = patient.patientId || patient.id;
                    if (pid && onOpenAddMedication) onOpenAddMedication(pid);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Create Reminder & Alarm for this patient"
                >
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Set Alarm</span>
                </button>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Care Circle Banner Card */}
      <div 
        onClick={onOpenCareCircle}
        className="bg-[#F0F9FF] border border-[#E0F2FE] hover:border-blue-300 p-4 rounded-3xl shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              Care Circle
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Invite family members or other caregivers
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
      </div>

    </div>
  );
};

