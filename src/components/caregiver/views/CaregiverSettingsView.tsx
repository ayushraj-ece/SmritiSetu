import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Shield, 
  Bell, 
  BellOff, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Info, 
  LogOut, 
  ChevronRight,
  Check
} from 'lucide-react';
import { auth } from '../../../services/firebase';
import { EditCaregiverProfileModal } from '../modals/EditCaregiverProfileModal';
import { CareCircleModal } from '../modals/CareCircleModal';
import { PrivacySecurityModal } from '../modals/PrivacySecurityModal';
import { HelpSupportModal } from '../modals/HelpSupportModal';
import { AppGuideModal } from '../modals/AppGuideModal';
import { SendFeedbackModal } from '../modals/SendFeedbackModal';
import { AboutAppModal } from '../modals/AboutAppModal';

interface Props {
  caregiverName?: string;
  caregiverEmail?: string;
  avatarUrl?: string;
  onLogout: () => void;
  onNavigateOption?: (option: string) => void;
}

export const CaregiverSettingsView: React.FC<Props> = ({
  caregiverName = 'Rahul Sharma',
  caregiverEmail = 'rahul.sharma@example.com',
  avatarUrl,
  onLogout,
  onNavigateOption
}) => {
  const [currentName, setCurrentName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('smritisetu_caregiver_profile');
      if (saved) return JSON.parse(saved).name || auth.currentUser?.displayName || caregiverName;
    } catch {}
    return auth.currentUser?.displayName || caregiverName;
  });
  const [currentPhone, setCurrentPhone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('smritisetu_caregiver_profile');
      if (saved) return JSON.parse(saved).phone || '+91 98765 43210';
    } catch {}
    return '+91 98765 43210';
  });
  const [currentRelation, setCurrentRelation] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('smritisetu_caregiver_profile');
      if (saved) return JSON.parse(saved).relation || 'Son';
    } catch {}
    return 'Son';
  });
  const currentEmail = auth.currentUser?.email || caregiverEmail;

  // Modal active states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCareCircle, setShowCareCircle] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAppGuide, setShowAppGuide] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Notification state toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Manage your account and app preferences
        </p>
      </div>

      {/* Profile Card */}
      <div 
        onClick={() => {
          setShowEditProfile(true);
          if (onNavigateOption) onNavigateOption('profile');
        }}
        className="bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-3xl shadow-2xs flex items-center justify-between cursor-pointer group transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-100 via-purple-50 to-indigo-200 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={currentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xl font-black text-indigo-700">
                {currentName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {currentName}
            </h3>
            <span className="text-xs font-semibold text-slate-400 block">
              Primary Caregiver
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              {currentEmail}
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
      </div>

      {/* Group 1: Account */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-400 block px-1">
          Account
        </span>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs divide-y divide-slate-50">
          <div 
            onClick={() => setShowEditProfile(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-t-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Profile Information
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Name, phone: {currentPhone}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>

          <div 
            onClick={() => setShowCareCircle(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Care Circle
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Manage family members and shared access
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>

          <div 
            onClick={() => setShowPrivacy(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-b-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Privacy & Security
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  App lock, biometric, data privacy
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Group 2: Notifications */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-400 block px-1">
          Notifications
        </span>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs divide-y divide-slate-50">
          <div 
            onClick={() => {
              const newState = !notificationsEnabled;
              setNotificationsEnabled(newState);
              showToast(newState ? 'Notifications enabled' : 'Notifications muted');
            }}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-t-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${notificationsEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Notification Preferences
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {notificationsEnabled ? 'Active (Push & SMS)' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          <div 
            onClick={() => {
              const newState = !quietHoursEnabled;
              setQuietHoursEnabled(newState);
              showToast(newState ? 'Quiet Hours set (10:00 PM - 07:00 AM)' : 'Quiet Hours turned off');
            }}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-b-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${quietHoursEnabled ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-700'}`}>
                <BellOff className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Quiet Hours
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {quietHoursEnabled ? 'Active (10:00 PM - 07:00 AM)' : '10:00 PM - 07:00 AM'}
                </p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${quietHoursEnabled ? 'bg-purple-600' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Group 3: Support */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-400 block px-1">
          Support
        </span>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs divide-y divide-slate-50">
          <div 
            onClick={() => setShowHelp(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-t-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Help & Support
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  FAQs, 24/7 hotline support
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>

          <div 
            onClick={() => setShowAppGuide(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  App Guide
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Learn how to monitor & pair patients
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>

          <div 
            onClick={() => setShowFeedback(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-b-3xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Send Feedback
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Share suggestions with our team
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Group 4: About */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-400 block px-1">
          About
        </span>

        <div 
          onClick={() => setShowAbout(true)}
          className="bg-white border border-slate-100 rounded-3xl shadow-2xs p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
              <Info className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                About Smritisetu
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Version 2.4.0 (Production Build)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* Log Out Action */}
      <div 
        onClick={onLogout}
        className="bg-white border border-red-100 hover:bg-red-50/50 p-4 rounded-3xl shadow-2xs flex items-center justify-between cursor-pointer group transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <LogOut className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-extrabold text-red-600">
            Log Out
          </span>
        </div>

        <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors" />
      </div>

      {/* Interactive Modals */}
      <EditCaregiverProfileModal
        isOpen={showEditProfile}
        currentName={currentName}
        currentEmail={currentEmail}
        currentPhone={currentPhone}
        currentRelation={currentRelation}
        onClose={() => setShowEditProfile(false)}
        onSave={(updated) => {
          setCurrentName(updated.name);
          setCurrentPhone(updated.phone);
          setCurrentRelation(updated.relation);
          showToast('Caregiver profile updated & synced to patient!');
        }}
      />

      <CareCircleModal
        isOpen={showCareCircle}
        onClose={() => setShowCareCircle(false)}
      />

      <PrivacySecurityModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <HelpSupportModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <AppGuideModal
        isOpen={showAppGuide}
        onClose={() => setShowAppGuide(false)}
      />

      <SendFeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      <AboutAppModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

    </div>
  );
};

