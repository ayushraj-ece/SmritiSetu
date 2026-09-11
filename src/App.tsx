import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { MultiScriptWelcome } from './components/onboarding/MultiScriptWelcome';
import { RoleSelectionScreen } from './components/onboarding/RoleSelectionScreen';
import { LiveAuthPage } from './pages/auth/LiveAuthPage';
import { PatientHome } from './components/patient/PatientHome';
import { CaregiverApp } from './components/caregiver/CaregiverApp';
import { DoctorPortalLayout } from './pages/doctor/DoctorPortalLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { onAuthStateChanged, auth } from './services/firebase';
import { authService } from './services/authService';
import type { UserRole, UserProfile } from './types';

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

        {/* Standalone SmritiSetu Doctor Clinical Web Portal */}
        <Route 
          path="/doctor" 
          element={
            <DoctorPortalLayout
              userProfile={userProfile}
              onLogout={() => {
                handleSetUserProfile(null);
                setOnboardingStep('welcome');
                navigate('/');
              }}
            />
          } 
        />
        <Route 
          path="/doctor/*" 
          element={
            <DoctorPortalLayout
              userProfile={userProfile}
              onLogout={() => {
                handleSetUserProfile(null);
                setOnboardingStep('welcome');
                navigate('/');
              }}
            />
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
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
