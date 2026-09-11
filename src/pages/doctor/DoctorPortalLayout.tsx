import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Pill, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronDown
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { UserProfile, DoctorProfile, DoctorPairingRequest } from '../../types';

import { DoctorDashboardView } from './views/DoctorDashboardView';
import { DoctorPatientsView } from './views/DoctorPatientsView';
import { DoctorPatientDetailView } from './views/DoctorPatientDetailView';
import { DoctorAppointmentsView } from './views/DoctorAppointmentsView';
import { DoctorPrescriptionsView } from './views/DoctorPrescriptionsView';
import { DoctorNotesView } from './views/DoctorNotesView';
import { DoctorMessagesView } from './views/DoctorMessagesView';
import { DoctorReportsView } from './views/DoctorReportsView';
import { DoctorSettingsView } from './views/DoctorSettingsView';
import { DoctorAuthView } from './DoctorAuthView';

interface Props {
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export const DoctorPortalLayout: React.FC<Props> = ({ userProfile, onLogout }) => {
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(() => {
    if (userProfile && userProfile.role === 'doctor') return userProfile;
    try {
      const saved = localStorage.getItem('smritisetu_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'doctor') return parsed;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'appointments' | 'prescriptions' | 'notes' | 'messages' | 'reports' | 'settings'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(() => {
    const uAny = userProfile as any;
    const sAny = sessionUser as any;
    return {
      uid: sessionUser?.uid || userProfile?.uid || 'doc_default',
      fullName: sAny?.name || uAny?.name || userProfile?.displayName || 'Dre',
      registrationNumber: uAny?.doctorRegNo || 'MCI/2024/0001',
      specialization: uAny?.doctorSpecialization || 'Neurology & Cognitive Care',
      qualification: uAny?.doctorQualification || 'MBBS, MD (Medicine), DM (Neurology)',
      experienceYears: uAny?.doctorExperience || 18,
      clinicHospital: uAny?.hospitalName || 'Metropolitan Cognitive Health Institute',
      address: '102 Medical Enclave, Health City',
      phone: '+91 98765 43210',
      email: sessionUser?.email || userProfile?.email || 'doctor@smritisetu.org',
      preferredLanguage: 'en',
      availability: 'Mon - Fri (09:00 AM - 05:00 PM)',
      createdAt: Date.now()
    };
  });

  const [pairingRequests, setPairingRequests] = useState<DoctorPairingRequest[]>([]);

  useEffect(() => {
    if (!sessionUser) return;
    const loadProfile = async () => {
      const p = await dataService.getDoctorProfile(sessionUser.uid);
      if (p) setDoctorProfile(p);
    };
    loadProfile();

    const unsubPairing = dataService.subscribeDoctorPairingRequests(doctorProfile.uid, (requests: DoctorPairingRequest[]) => {
      setPairingRequests(requests);
    });

    return () => unsubPairing();
  }, [sessionUser?.uid, doctorProfile.uid]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleClearSelectedPatient = () => {
    setSelectedPatientId(null);
  };

  const handleLogoutDoctor = () => {
    localStorage.removeItem('smritisetu_user_profile');
    setSessionUser(null);
    onLogout();
  };

  if (!sessionUser || sessionUser.role !== 'doctor') {
    return (
      <DoctorAuthView 
        onSuccess={(profile) => {
          setSessionUser(profile);
          const pAny = profile as any;
          setDoctorProfile(prev => ({
            ...prev,
            uid: profile.uid,
            fullName: pAny.name || profile.displayName || prev.fullName,
            email: profile.email || prev.email
          }));
        }} 
      />
    );
  }

  const pendingRequestsCount = pairingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-100">
      {/* Top Search & Profile Bar Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 h-16 flex items-center px-6 justify-between gap-4">
        {/* Search Bar Container */}
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name or Patient ID..."
              className="w-full bg-[#F1F5F9] border-none rounded-xl pl-10 pr-20 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 transition-all"
            />
            <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Right Action Icons & Doctor Badge */}
        <div className="flex items-center gap-5">
          {/* Bell Notification Icon */}
          <button
            onClick={() => {
              setSelectedPatientId(null);
              setActiveTab('dashboard');
            }}
            className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications & Pairing Requests"
          >
            <Bell className="w-5 h-5" />
            {pendingRequestsCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {pendingRequestsCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Doctor Profile Info */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('settings')}>
            <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              {doctorProfile?.fullName ? doctorProfile.fullName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  Dr. {doctorProfile?.fullName?.startsWith('Dr.') ? doctorProfile.fullName.replace(/^Dr\.\s*/, '') : (doctorProfile?.fullName || 'Dre')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {doctorProfile?.specialization || 'Neurology & Cognitive Care'}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogoutDoctor}
            className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-5 shrink-0 hidden md:flex">
          <div className="space-y-6">
            {/* Logo & Clinical Brand Header */}
            <div className="flex items-start gap-3">
              {/* Interlocking circles blue logo icon */}
              <div className="w-10 h-10 shrink-0 text-[#0284C7]">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M35 65C46.0457 65 55 56.0457 55 45C55 33.9543 46.0457 25 35 25C23.9543 25 15 33.9543 15 45C15 56.0457 23.9543 65 35 65Z" stroke="#0284C7" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M65 75C76.0457 75 85 66.0457 85 55C85 43.9543 76.0457 35 65 35C53.9543 35 45 43.9543 45 55C45 66.0457 53.9543 75 65 75Z" stroke="#0284C7" strokeWidth="10" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg tracking-tight leading-tight">স্মৃতিসেতু</div>
                <div className="text-xs font-semibold text-slate-800 leading-tight">Clinical Portal</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">Bridging Memory & Clinical Care</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'notes', label: 'Clinical Notes', icon: FileText },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !selectedPatientId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleClearSelectedPatient();
                      setActiveTab(item.id as any);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#EBF5FF] text-[#0284C7] font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-3 pb-1">
                <hr className="border-t border-slate-200/80" />
              </div>

              <button
                onClick={() => {
                  handleClearSelectedPatient();
                  setActiveTab('settings');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings' && !selectedPatientId
                    ? 'bg-[#EBF5FF] text-[#0284C7] font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                <span>Profile & Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom Hospital/Institute Info Box */}
          <div className="bg-[#EBF5FF]/70 border border-sky-100 rounded-xl p-3.5 space-y-1 text-slate-600">
            <h4 className="text-[11px] font-bold text-slate-800 leading-tight">
              Metropolitan Cognitive Health Institute (TEST)
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">Reg: MCI/2024/0001</p>
            <p className="text-[10px] text-slate-400 pt-2 leading-relaxed italic">
              Better Care.<br />Brighter Tomorrows.
            </p>
          </div>
        </aside>

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {selectedPatientId ? (
            <DoctorPatientDetailView
              doctor={doctorProfile}
              patientId={selectedPatientId}
              onBack={handleClearSelectedPatient}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DoctorDashboardView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                  onNavigateTab={(t: string) => setActiveTab(t as any)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'patients' && (
                <DoctorPatientsView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'appointments' && (
                <DoctorAppointmentsView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'prescriptions' && (
                <DoctorPrescriptionsView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'notes' && (
                <DoctorNotesView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'messages' && (
                <DoctorMessagesView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'reports' && (
                <DoctorReportsView
                  doctor={doctorProfile}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'settings' && (
                <DoctorSettingsView
                  doctor={doctorProfile}
                  onUpdateDoctor={(updated) => setDoctorProfile(updated)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
