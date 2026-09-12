import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole, UserProfile } from '../../types';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

interface Props {
  allowedRoles: UserRole[];
  userProfile: UserProfile | null;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles, userProfile, children }) => {
  const navigate = useNavigate();

  // Fallback check from localStorage if userProfile prop is temporarily syncing
  const effectiveProfile: UserProfile | null = userProfile || (() => {
    try {
      const saved = localStorage.getItem('smritisetu_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isAuthorized = effectiveProfile && allowedRoles.includes(effectiveProfile.role);

  useEffect(() => {
    if (!effectiveProfile) {
      // Unauthenticated -> redirect to auth after brief delay
      const timer = setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!isAuthorized) {
      // Unauthorized -> redirect to user's assigned portal after brief notification
      const timer = setTimeout(() => {
        navigate(`/${effectiveProfile.role}`, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [effectiveProfile, isAuthorized, navigate]);

  if (!effectiveProfile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400">
            Please sign in to access SmritiSetu services. Redirecting to authentication page...
          </p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full py-3 bg-[#1E7F53] hover:bg-[#146743] text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            Go to Sign In Page
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    const roleLabels: Record<UserRole, string> = {
      patient: 'Patient Portal',
      caregiver: 'Caregiver Portal',
      doctor: 'Doctor Web Portal'
    };

    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-950 border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-red-500/20">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Unauthorized Portal Entry
            </h2>
            <p className="text-xs text-slate-300">
              Your account identity is registered as <strong className="text-emerald-400 uppercase font-extrabold">{effectiveProfile.role}</strong>. You are not authorized to view this portal.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 text-left space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Account:</span>
              <span className="text-slate-200 font-mono">{effectiveProfile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Assigned Portal:</span>
              <span className="text-emerald-400 font-bold">{roleLabels[effectiveProfile.role]}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/${effectiveProfile.role}`, { replace: true })}
            className="w-full py-3.5 bg-[#1E7F53] hover:bg-[#146743] text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Return to {roleLabels[effectiveProfile.role]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
