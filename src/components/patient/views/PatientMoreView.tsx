import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { authService } from '../../../services/authService';

interface Props {
  onNavigate: (view: 'profile' | 'caregivers' | 'messages' | 'progress' | 'language' | 'appearance' | 'settings' | 'help' | 'about') => void;
  onLogout?: () => void;
}

export const PatientMoreView: React.FC<Props> = ({ onNavigate, onLogout }) => {
  const { language, setLanguage } = useLanguage();
  const [activeModal, setActiveModal] = useState<'language' | 'appearance' | 'settings' | 'help' | 'about' | null>(null);

  // Settings State
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [soundAlarms, setSoundAlarms] = useState<boolean>(true);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

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
      subtitle: 'View paired caregivers and patient code',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      action: () => onNavigate('caregivers')
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
      icon: <BarChart3 className="w-5 h-5 text-pink-600" />,
      iconBg: 'bg-pink-100',
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
      icon: <Palette className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100',
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
            Your app, your way
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
                <p className="text-xs text-slate-600 font-medium">Son: Rahul Kumar (+91 98100 12345)</p>
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
