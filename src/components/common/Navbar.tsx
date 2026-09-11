import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { UserRole, Language, UserProfile } from '../../types';
import { syncService } from '../../services/syncService';
import { authService } from '../../services/authService';
import { SmritiSetuLogo } from '../brand/SmritiSetuLogo';
import { 
  WifiOff, 
  RefreshCw, 
  LogOut,
  ArrowLeft,
  Globe
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onExitToLanding: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  currentRole, 
  userProfile: _userProfile,
  onLogout,
  onExitToLanding
}) => {
  const { t, language, setLanguage } = useLanguage();
  
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      setSyncStatusMsg(t('syncing'));
      const res = await syncService.syncPendingData();
      setIsSyncing(false);
      if (res.syncedCount > 0) {
        setSyncStatusMsg(`Synced ${res.syncedCount} records.`);
        setTimeout(() => setSyncStatusMsg(''), 4000);
      } else {
        setSyncStatusMsg('');
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t]);

  const handleSignOut = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] text-[#0F172A] shadow-xs">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="bg-[#0284C7] text-white text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('offlineMode')}</span>
        </div>
      )}

      {isSyncing && (
        <div className="bg-[#0369A1] text-white text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-2 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          <span>{t('syncing')}</span>
        </div>
      )}

      {syncStatusMsg && !isSyncing && isOnline && (
        <div className="bg-[#0EA5E9] text-white text-xs text-center py-1.5 px-4 font-semibold">
          ✓ {syncStatusMsg}
        </div>
      )}

      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={onExitToLanding}>
          <SmritiSetuLogo variant="horizontal" size="sm" showTagline={false} />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3.5 py-2 border border-[#E2E8F0] rounded-xl hover:border-[#0284C7] transition-all">
            <Globe className="w-4 h-4 text-[#0284C7] shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-[#0F172A] outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="as">Assamese (অসমীয়া)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="brx">Bodo (বড়ো)</option>
              <option value="mni">Manipuri (মৈতেইলোন্)</option>
              <option value="kha">Khasi (Ka Ktien Khasi)</option>
              <option value="lus">Mizo (Mizo ṭawng)</option>
              <option value="ne">Nepali (নেपाली)</option>
              <option value="trp">Kokborok (Kokborok)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#F0F9FF] text-[#0284C7] px-3.5 py-1.5 rounded-full border border-[#BAE6FD] uppercase tracking-wider">
              {currentRole}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] hover:text-[#0284C7] px-3.5 py-2 text-xs font-bold border border-[#E2E8F0] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Exit / Landing Button */}
          <button
            onClick={onExitToLanding}
            className="p-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-xl transition-all cursor-pointer"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
