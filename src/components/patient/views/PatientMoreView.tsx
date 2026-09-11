import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  BarChart3, 
  Languages, 
  Palette, 
  Settings, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Sparkles,
  X,
  Check,
  Volume2,
  Bell,
  ShieldCheck,
  PhoneCall,
  RefreshCw,
  LogOut,
  MessageSquare,
  Stethoscope,
  Pill,
  CheckSquare,
  FileText,
  Clock,
  Building2
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { authService } from '../../../services/authService';
import { dataService } from '../../../services/dataService';
import type { PatientProfile, Prescription, PatientNote, PatientReminder } from '../../../types';

interface Props {
  patientProfile?: PatientProfile;
  onNavigate: (view: 'profile' | 'caregivers' | 'messages' | 'progress' | 'language' | 'appearance' | 'settings' | 'help' | 'about') => void;
  onLogout?: () => void;
}

export const PatientMoreView: React.FC<Props> = ({ patientProfile, onNavigate, onLogout }) => {
  const { language, setLanguage } = useLanguage();
  const [activeModal, setActiveModal] = useState<
    'language' | 'appearance' | 'settings' | 'help' | 'about' | 'doctor' | 'notes' | 'tasks' | 'prescriptions' | null
  >(null);

  // Settings State
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [soundAlarms, setSoundAlarms] = useState<boolean>(true);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Real data state
  const patientId = patientProfile?.patientId || patientProfile?.id || 'ASM58291';
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [reminders, setReminders] = useState<PatientReminder[]>([]);

  useEffect(() => {
    if (!patientId) return;
    const unsubRx = dataService.subscribePrescriptions(patientId, setPrescriptions);
    const unsubNotes = dataService.subscribeNotes(patientId, setNotes);
    const unsubRem = dataService.subscribeReminders(patientId, setReminders);
    return () => {
      unsubRx();
      unsubNotes();
      unsubRem();
    };
  }, [patientId]);

  const menuItems = [
    {
      id: 'profile' as const,
      title: 'My Profile',
      subtitle: 'Manage your personal & health information',
      icon: <User className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      action: () => onNavigate('profile')
    },
    {
      id: 'caregivers' as const,
      title: 'Caregivers & Family',
      subtitle: 'View paired caregivers and emergency contact',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      action: () => onNavigate('caregivers')
    },
    {
      id: 'doctor' as const,
      title: 'My Doctor & Care Team',
      subtitle: 'Doctor info, hospital & direct messaging',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
      action: () => setActiveModal('doctor')
    },
    {
      id: 'prescriptions' as const,
      title: 'Prescriptions',
      subtitle: 'Active medicines prescribed by doctor',
      icon: <Pill className="w-5 h-5 text-pink-600" />,
      iconBg: 'bg-pink-100',
      action: () => setActiveModal('prescriptions')
    },
    {
      id: 'tasks' as const,
      title: 'Doctor Tasks & Care Plan',
      subtitle: 'Daily care plan tasks from doctor',
      icon: <CheckSquare className="w-5 h-5 text-teal-600" />,
      iconBg: 'bg-teal-100',
      action: () => setActiveModal('tasks')
    },
    {
      id: 'notes' as const,
      title: 'Clinical Notes',
      subtitle: 'Doctor clinical assessments & notes',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-100',
      action: () => setActiveModal('notes')
    },
    {
      id: 'messages' as const,
      title: 'Messages & Chat',
      subtitle: 'Chat with your paired caregiver & doctor',
      icon: <MessageSquare className="w-5 h-5 text-sky-600" />,
      iconBg: 'bg-sky-100',
      action: () => onNavigate('messages')
    },
    {
      id: 'progress' as const,
      title: 'My Progress',
      subtitle: 'View your activity & cognitive scores',
      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100',
      action: () => onNavigate('progress')
    },
    {
      id: 'language' as const,
      title: 'Language & Voice',
      subtitle: `Current: ${language === 'as' ? 'অসমীয়া (Assamese)' : 'English'}`,
      icon: <Languages className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
      action: () => setActiveModal('language')
    },
    {
      id: 'appearance' as const,
      title: 'Appearance',
      subtitle: `Text size: ${textSize.toUpperCase()}`,
      icon: <Palette className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      action: () => setActiveModal('appearance')
    },
    {
      id: 'settings' as const,
      title: 'Settings',
      subtitle: 'Voice assistant, sound & notifications',
      icon: <Settings className="w-5 h-5 text-slate-600" />,
      iconBg: 'bg-slate-100',
      action: () => setActiveModal('settings')
    },
    {
      id: 'help' as const,
      title: 'Help & Support',
      subtitle: 'Helpline & caregiver call',
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      action: () => setActiveModal('help')
    },
    {
      id: 'about' as const,
      title: 'About MindCare',
      subtitle: 'Version 1.0.0 (AI Adaptive Edition)',
      icon: <Info className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      action: () => setActiveModal('about')
    }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-in fade-in duration-300 px-4 sm:px-0 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            MINDCARE
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
            More
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Your health, care team & preferences
          </p>
        </div>

        <div className="bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold text-[#1E7F53] shadow-xs">
          <span>Small steps big smiles ♡</span>
        </div>
      </div>

      {/* Navigation Options List */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className="bg-white border border-slate-100 hover:border-emerald-200 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1E7F53] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        ))}

        {/* Log Out Option */}
        <div
          onClick={async () => {
            await authService.logout();
            if (onLogout) onLogout();
          }}
          className="bg-rose-50 border border-rose-100 hover:bg-rose-100/80 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-800">
                Log Out of Account
              </h3>
              <p className="text-xs text-rose-500 font-medium">
                Sign out of SmritiSetu safely
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>

      {/* Quote Footer */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
        <p className="text-xs font-bold text-[#1E7F53] italic flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>"A healthier tomorrow is a brighter you." ♡</span>
        </p>
      </div>

      {/* My Doctor & Care Team Modal */}
      {activeModal === 'doctor' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">My Doctor & Care Team</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {patientProfile?.doctorName ? 'Verified Attending Doctor' : 'No Doctor Linked'}
                </span>
                <span className="text-xs text-slate-400 font-medium">Doctor Controlled</span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  {patientProfile?.doctorName || 'No Doctor Linked Yet'}
                </h4>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{patientProfile?.doctorHospital || (patientProfile?.doctorName ? 'Hospital facility not specified' : 'Link via Doctor Portal pairing code')}</span>
                </p>
              </div>

              <p className="text-xs text-slate-600 font-normal leading-relaxed bg-white/70 p-3 rounded-xl border border-blue-50">
                {patientProfile?.doctorName 
                  ? 'Your doctor manages your prescriptions, clinical notes, and daily care plan.' 
                  : 'To link your attending doctor, ask your doctor to send a pairing request using your Patient ID.'}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setActiveModal(null);
                  onNavigate('messages');
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Doctor & Caregiver</span>
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions Modal */}
      {activeModal === 'prescriptions' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Doctor Prescriptions</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-2">
                <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-extrabold text-slate-800">No Prescriptions Issued Yet</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  When your attending doctor issues a prescription in the Doctor Portal, it will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="bg-pink-50/50 border border-pink-100 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900">{rx.medicineName}</h4>
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                        {rx.dosage}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-500" />
                        {rx.time}
                      </span>
                      <span>•</span>
                      <span>{(!rx.daysOfWeek || rx.daysOfWeek.length === 7 || rx.daysOfWeek.includes('Daily')) ? 'Daily' : rx.daysOfWeek.join(', ')}</span>
                    </div>
                    {rx.instructions && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-pink-50">
                        {rx.instructions}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium text-right">
                      Prescribed by: {rx.prescribedBy || 'Attending Doctor'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Doctor Tasks Modal */}
      {activeModal === 'tasks' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Doctor Tasks & Care Plan</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-extrabold text-slate-800">No Doctor Tasks Assigned Yet</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  When your doctor or caregiver schedules care plan tasks or alarms, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reminders.map((task) => (
                  <div key={task.id} className="bg-teal-50/50 border border-teal-100 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-900">{task.title || (task as any).name || 'Daily Care Plan Task'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-600" />
                        <span>{task.time} ({task.repeatPattern})</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full shrink-0">
                      {task.scheduledBy || 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Clinical Notes Modal */}
      {activeModal === 'notes' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Clinical Notes</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-extrabold text-slate-800">No Clinical Notes Recorded Yet</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  When your doctor or caregiver adds observation notes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">{note.title || note.category}</h4>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {note.role || 'Clinical Note'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-indigo-50 leading-relaxed">
                      {note.body}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium text-right">
                      Written by: {note.writtenBy} • {new Date(note.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Select App Language</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setLanguage('en'); setActiveModal(null); }}
                className={`w-full p-4 rounded-2xl border text-left font-bold flex items-center justify-between cursor-pointer transition-all ${
                  language === 'en' ? 'border-[#1E7F53] bg-[#EBFBF0] text-[#1E7F53]' : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>English (US)</span>
                {language === 'en' && <Check className="w-5 h-5 text-[#1E7F53]" />}
              </button>
              <button
                onClick={() => { setLanguage('as'); setActiveModal(null); }}
                className={`w-full p-4 rounded-2xl border text-left font-bold flex items-center justify-between cursor-pointer transition-all ${
                  language === 'as' ? 'border-[#1E7F53] bg-[#EBFBF0] text-[#1E7F53]' : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>অসমীয়া (Assamese)</span>
                {language === 'as' && <Check className="w-5 h-5 text-[#1E7F53]" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Modal */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Appearance & Text</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Display Size</p>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'xlarge'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`py-3 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                      textSize === size ? 'bg-[#1E7F53] text-white border-[#1E7F53]' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-full py-3 bg-[#1E7F53] text-white rounded-2xl text-xs font-extrabold cursor-pointer mt-2"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">App Settings</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-800">Voice Assistant Guidance</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={voiceGuidance} 
                  onChange={(e) => setVoiceGuidance(e.target.checked)} 
                  className="w-4 h-4 accent-[#1E7F53]" 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-800">Sound Alarms</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={soundAlarms} 
                  onChange={(e) => setSoundAlarms(e.target.checked)} 
                  className="w-4 h-4 accent-[#1E7F53]" 
                />
              </div>

              <button
                onClick={() => {
                  localStorage.clear();
                  alert('Local offline cache cleared!');
                  setActiveModal(null);
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Offline Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Help & Emergency</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="tel:112"
                className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency Helpline (112)</span>
              </a>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-left">
                <h4 className="text-xs font-extrabold text-slate-900">Caregiver Contact</h4>
                <p className="text-xs text-slate-600 font-medium">
                  {patientProfile?.caregiverName || 'Caregiver'}: {((patientProfile?.caregiverPhone || patientProfile?.emergencyContact || '+91 98765 43210').replace(/\s*\([^)]*\)/g, '').trim())}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-[#1E7F53] rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">MindCare Patient App</h3>
              <p className="text-xs text-slate-500 font-medium pt-0.5">Version 1.0.0 (SIH Special Edition)</p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl leading-relaxed">
              Designed with care for senior wellness, cognitive training, and daily activity tracking.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-[#1E7F53] text-white rounded-2xl text-xs font-extrabold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
