import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { MultiScriptWelcome } from './components/onboarding/MultiScriptWelcome';
import { RoleSelectionScreen } from './components/onboarding/RoleSelectionScreen';
import { LiveAuthPage } from './pages/auth/LiveAuthPage';
import { Navbar } from './components/common/Navbar';
import { PatientHome } from './components/patient/PatientHome';
import { CaregiverApp } from './components/caregiver/CaregiverApp';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { onAuthStateChanged, auth } from './services/firebase';
import { authService } from './services/authService';
import type { UserRole, UserProfile } from './types';
import { ReminderAlarmClock } from './components/common/ReminderAlarmClock';

const MainLayout: React.FC<{
  currentRole: UserRole;
  userProfile: UserProfile | null;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ currentRole, userProfile, highContrast, setHighContrast, onLogout, children }) => {
  const navigate = useNavigate();
  const activePatientId = userProfile?.patientId || 'ASM58291';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${highContrast ? 'high-contrast' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar 
        currentRole={currentRole} 
        onRoleChange={(role) => navigate(`/${role}`)}
        userProfile={userProfile}
        onLogout={() => {
          onLogout();
          navigate('/');
        }}
        onExitToLanding={() => navigate('/')}
      />

      <ReminderAlarmClock patientId={activePatientId} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white text-slate-500 py-6 border-t border-slate-200 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="text-slate-900 font-bold">স্মৃতিসেতু (SMRITISETU)</span>
            <span className="text-[#0284C7]">•</span>
            <span className="text-xs text-slate-500 font-normal">Bridging Memory & Care • SIH 2026 PS 26003 (MDoNER)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold transition-all cursor-pointer"
            >
              {highContrast ? 'Normal Contrast' : 'High Contrast Mode'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold cursor-pointer"
            >
              Onboarding Flow
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [onboardingStep, setOnboardingStep] = useState<'splash' | 'welcome' | 'role_select' | 'auth' | 'completed'>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('smritisetu_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const handleSetUserProfile = (prof: UserProfile | null) => {
    setUserProfile(prof);
    if (prof) {
      localStorage.setItem('smritisetu_user_profile', JSON.stringify(prof));
    } else {
      localStorage.removeItem('smritisetu_user_profile');
    }
  };

  useEffect(() => {
    if (location.pathname === '/auth') {
      setOnboardingStep('auth');
    } else if (location.pathname.startsWith('/patient') || location.pathname.startsWith('/caregiver') || location.pathname.startsWith('/doctor')) {
      setOnboardingStep('completed');
    }
  }, [location.pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const prof = await authService.loginUser(user.email || '', '');
        if (prof) {
          handleSetUserProfile(prof);
        }
      }
    });
    return () => unsub();
  }, []);

  const activePatientId = userProfile?.patientId || 'ASM58291';

  return (
    <>
      <Routes>
        {/* Onboarding Launch Sequence */}
        <Route 
          path="/" 
          element={
            onboardingStep === 'splash' ? (
              <SplashScreen onFinish={() => setOnboardingStep('welcome')} />
            ) : onboardingStep === 'welcome' ? (
              <MultiScriptWelcome 
                onContinue={() => setOnboardingStep('role_select')} 
              />
            ) : onboardingStep === 'role_select' ? (
              <RoleSelectionScreen 
                onSelectRole={(role) => {
                  setSelectedRole(role);
                  setOnboardingStep('auth');
                }}
                onBack={() => setOnboardingStep('welcome')}
              />
            ) : (
              <LiveAuthPage
                initialRole={selectedRole}
                onSuccess={(profile) => {
                  handleSetUserProfile(profile);
                  setOnboardingStep('completed');
                  navigate(`/${profile.role}`);
                }}
                onBackToLanding={() => setOnboardingStep('role_select')}
              />
            )
          } 
        />

        {/* Live Authentication direct route */}
        <Route 
          path="/auth" 
          element={
            <LiveAuthPage
              initialRole={selectedRole}
              onSuccess={(profile) => {
                handleSetUserProfile(profile);
                setOnboardingStep('completed');
                navigate(`/${profile.role}`);
              }}
              onBackToLanding={() => navigate('/')}
            />
          } 
        />

        {/* Standalone SmritiSetu Patient Application */}
        <Route 
          path="/patient/*" 
          element={
            <PatientHome 
              patientId={activePatientId} 
              onLogout={() => {
                handleSetUserProfile(null);
                setOnboardingStep('welcome');
                navigate('/');
              }}
            />
          } 
        />

        {/* Standalone SmritiSetu Caregiver Application */}
        <Route 
          path="/caregiver/*" 
          element={
            <CaregiverApp 
              patientId={userProfile?.role === 'patient' ? userProfile.patientId : undefined} 
              onLogout={() => {
                handleSetUserProfile(null);
                setOnboardingStep('welcome');
                navigate('/');
              }}
            />
          } 
        />

        {/* Doctor Dashboard */}
        <Route 
          path="/doctor" 
          element={
            <MainLayout
              currentRole="doctor"
              userProfile={userProfile}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              onLogout={() => setUserProfile(null)}
            >
              <DoctorDashboard />
            </MainLayout>
          } 
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </LanguageProvider>
  );
}
