import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { offlineStorage } from '../../services/offlineStorage';
import { dataService } from '../../services/dataService';
import { auth } from '../../services/firebase';
import type { PatientReminder, GameResult, PatientProfile, PairingRequest, DoctorPairingRequest, AppNotification } from '../../types';

import { PatientHomeView } from './views/PatientHomeView';
import { PatientGamesView, GAMES_LIST, type GameItem } from './views/PatientGamesView';
import { PatientGameDetailView } from './views/PatientGameDetailView';
import { PatientRemindersView } from './views/PatientRemindersView';
import { PatientAddReminderView } from './views/PatientAddReminderView';
import { PatientMoreView } from './views/PatientMoreView';
import { PatientProfileView } from './views/PatientProfileView';
import { PatientProgressView } from './views/PatientProgressView';
import { PatientCaregiverView } from './views/PatientCaregiverView';
import { PatientMessagesView } from './views/PatientMessagesView';
import { PatientBottomNav, type PatientTab } from './ui/PatientBottomNav';
import { ReminderAlarmClock } from '../common/ReminderAlarmClock';
import { RealTimeChatModal } from '../chat/RealTimeChatModal';
import { NotificationsModal } from '../common/NotificationsModal';
import { MessageSquare, Users, Check, X } from 'lucide-react';

import { MemoryGame } from '../../games/MemoryGame';
import { AttentionGame } from '../../games/AttentionGame';
import { PatternGame } from '../../games/PatternGame';
import { RoutineGame } from '../../games/RoutineGame';
import { MemoryLane } from '../memory/MemoryLane';

interface Props {
  patientId: string;
  onLogout?: () => void;
}

const GameDetailRouteWrapper: React.FC<{
  onStartGame: (gameItem: GameItem) => void;
}> = ({ onStartGame }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const foundGame = GAMES_LIST.find((g) => g.id === gameId);

  if (!foundGame) {
    return <Navigate to="/patient/games" replace />;
  }

  return (
    <PatientGameDetailView
      game={foundGame}
      onBack={() => navigate('/patient/games')}
      onStartGame={(_difficulty) => onStartGame(foundGame)}
    />
  );
};

export const PatientHome: React.FC<Props> = ({ patientId, onLogout }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeGameItem, setActiveGameItem] = useState<GameItem | null>(null);
  const [pairingRequests, setPairingRequests] = useState<PairingRequest[]>([]);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  // Dynamic Patient Profile State (strictly isolated by patientId)
  const [profile, setProfile] = useState<PatientProfile>(() => {
    const cached = offlineStorage.getPatientProfile(patientId);
    if (cached) return cached;
    return {
      id: patientId,
      patientId,
      name: auth.currentUser?.displayName || 'Patient',
      email: auth.currentUser?.email || '',
      age: 70,
      gender: 'Male',
      state: 'Assam',
      preferredLanguage: language || 'en',
      createdAt: Date.now()
    };
  });

  // Dynamic Reminders State
  const [reminders, setReminders] = useState<PatientReminder[]>(() => {
    return offlineStorage.getReminders(patientId);
  });

  // Dynamic Game Results State
  const [gameResults, setGameResults] = useState<GameResult[]>(() => {
    return offlineStorage.getGameResults(patientId);
  });

  const [doctorRequests, setDoctorRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Subscribe to real-time updates from Firestore / Local offline storage
  useEffect(() => {
    const loadProfile = async () => {
      const liveProf = await dataService.searchPatientById(patientId);
      if (liveProf) {
        setProfile(liveProf);
      }
    };
    loadProfile();

    const unsubReminders = dataService.subscribeReminders(patientId, (remList) => {
      setReminders([...remList]);
    });

    const unsubResults = dataService.subscribeGameResults(patientId, (resList) => {
      setGameResults([...resList]);
    });

    const unsubPairing = dataService.subscribePairingRequests(patientId, (reqList) => {
      setPairingRequests([...reqList]);
    });

    const unsubDocPairing = dataService.subscribeDoctorPairingRequests(undefined, (docReqs: DoctorPairingRequest[]) => {
      const pReqs = docReqs.filter(r => r.patientId === patientId && r.status === 'pending');
      setDoctorRequests(pReqs);

      // Also process accepted pairing requests — update profile with doctor info
      const acceptedReq = docReqs.find(r => r.patientId === patientId && r.status === 'accepted');
      if (acceptedReq) {
        setProfile(prev => {
          if (prev && !prev.doctorId) {
            const updated = {
              ...prev,
              doctorId: acceptedReq.doctorId,
              doctorName: acceptedReq.doctorName,
              doctorHospital: acceptedReq.doctorHospital,
              isDoctorLinked: true
            };
            offlineStorage.savePatientProfile(updated);
            return updated;
          }
          return prev;
        });
      }
    });

    const unsubNotifs = dataService.subscribeUserNotifications(patientId, (list) => {
      setNotifications(list);
    });

    const handleProfileUpdate = async () => {
      const p = await dataService.searchPatientById(patientId);
      if (p) setProfile(p);
    };
    window.addEventListener('patientProfileUpdated', handleProfileUpdate);

    return () => {
      unsubReminders();
      unsubResults();
      unsubPairing();
      unsubDocPairing();
      unsubNotifs();
      window.removeEventListener('patientProfileUpdated', handleProfileUpdate);
    };
  }, [patientId]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleRespondPairing = async (requestId: string, caregiverUid: string, caregiverName: string, accept: boolean) => {
    await dataService.respondToPairingRequest(requestId, accept ? 'accepted' : 'declined', patientId, caregiverUid, caregiverName);
    setPairingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRespondDoctorPairing = async (requestId: string, accept: boolean) => {
    await dataService.respondDoctorPairingRequest(requestId, accept ? 'accepted' : 'rejected', 'patient');
    setDoctorRequests(prev => prev.filter(r => r.id !== requestId));
    // Reload profile
    const p = await dataService.searchPatientById(patientId);
    if (p) setProfile(p);
  };

  const handleToggleReminder = async (reminderId: string, completed: boolean) => {
    await dataService.toggleReminder(reminderId, completed);
    setReminders(offlineStorage.getReminders(patientId));
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await dataService.deleteReminder(reminderId);
    setReminders(offlineStorage.getReminders(patientId));
  };

  const handleSaveReminder = async (newReminder: PatientReminder) => {
    await dataService.addReminder(newReminder);
    setReminders(offlineStorage.getReminders(patientId));
    navigate('/patient/reminders');
  };

  const handleUpdateProfile = (updatedProps: Partial<PatientProfile>) => {
    const updated = { ...profile, ...updatedProps };
    setProfile(updated);
    offlineStorage.savePatientProfile(updated);
  };

  const getActiveTab = (): PatientTab => {
    const path = location.pathname;
    if (path.startsWith('/patient/games')) return 'games';
    if (path.startsWith('/patient/reminders')) return 'reminders';
    if (path.startsWith('/patient/more') || path.startsWith('/patient/profile') || path.startsWith('/patient/memories')) return 'more';
    return 'home';
  };

  const handleBottomTabChange = (tab: PatientTab) => {
    if (tab === 'home') navigate('/patient');
    if (tab === 'games') navigate('/patient/games');
    if (tab === 'reminders') navigate('/patient/reminders');
    if (tab === 'more') navigate('/patient/more');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 font-sans relative">
      
      {/* Live Alarm Monitor */}
      <ReminderAlarmClock patientId={patientId} />

      {/* Pending Doctor Pairing Request Banner */}
      {doctorRequests.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-[#0284C7] flex flex-col gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-[#0284C7] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Doctor Clinical Authorization Request</h4>
              <p className="text-xs text-slate-300">
                <strong className="text-sky-300">{doctorRequests[0].doctorName}</strong> ({doctorRequests[0].doctorHospital || 'Medical Hospital'}) has requested access to view your cognitive chart and manage medical prescriptions.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleRespondDoctorPairing(doctorRequests[0].id, true)}
              className="flex-1 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Authorize Doctor Link
            </button>
            <button
              onClick={() => handleRespondDoctorPairing(doctorRequests[0].id, false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      {/* Pending Caregiver Pairing Request Banner / Modal */}
      {pairingRequests.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-sky-400/50 flex flex-col gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Caregiver Pairing Request</h4>
              <p className="text-xs text-slate-300">
                <strong className="text-sky-300">{pairingRequests[0].caregiverName}</strong> wants to pair with your account to assist your daily care.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleRespondPairing(pairingRequests[0].id, pairingRequests[0].caregiverUid, pairingRequests[0].caregiverName, true)}
              className="flex-1 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Accept Pairing
            </button>
            <button
              onClick={() => handleRespondPairing(pairingRequests[0].id, pairingRequests[0].caregiverUid, pairingRequests[0].caregiverName, false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatModal(true)}
        className="fixed bottom-20 right-4 z-40 p-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        title="Open Caregiver Chat"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="text-xs font-bold hidden sm:inline">Live Chat</span>
      </button>

      {/* Real-time Chat Modal */}
      {showChatModal && (
        <RealTimeChatModal
          patientId={patientId}
          currentUserUid={auth.currentUser?.uid || patientId}
          currentUserName={profile.name || 'Patient'}
          currentUserRole="patient"
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Real-time Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        patientId={patientId}
        userId={patientId}
        role="patient"
      />

      {/* Standalone Mobile App Routes */}
      <main className="pt-0 pb-6 w-full">
        <Routes>
          {/* Patient Home */}
          <Route 
            path="/" 
            element={
              <PatientHomeView
                patientProfile={profile}
                reminders={reminders}
                gameResults={gameResults}
                unreadNotificationsCount={unreadNotifCount}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onNavigate={(view) => {
                  if (view === 'games') navigate('/patient/games');
                  else if (view === 'reminders') navigate('/patient/reminders');
                  else if (view === 'more') navigate('/patient/more');
                  else if (view === 'profile') navigate('/patient/profile');
                  else if (view === 'memories') navigate('/patient/memories');
                  else if (view === 'progress') navigate('/patient/progress');
                }}
                onToggleReminder={handleToggleReminder}
                onOpenVoice={() => {}}
              />
            } 
          />

          {/* Patient Games List */}
          <Route 
            path="/games" 
            element={
              <PatientGamesView
                onSelectGame={(gameItem) => {
                  navigate(`/patient/games/${gameItem.id}`);
                }}
              />
            } 
          />

          {/* Game Detail View */}
          <Route 
            path="/games/:gameId" 
            element={
              <GameDetailRouteWrapper
                onStartGame={(gameItem) => {
                  setActiveGameItem(gameItem);
                }}
              />
            } 
          />

          {/* Reminders List */}
          <Route 
            path="/reminders" 
            element={
              <PatientRemindersView
                reminders={reminders}
                gameResults={gameResults}
                onToggleReminder={handleToggleReminder}
                onDeleteReminder={handleDeleteReminder}
                onOpenAddReminder={() => navigate('/patient/reminders/new')}
              />
            } 
          />

          {/* Add Reminder Screen */}
          <Route 
            path="/reminders/new" 
            element={
              <PatientAddReminderView
                patientId={patientId}
                onBack={() => navigate('/patient/reminders')}
                onSave={handleSaveReminder}
              />
            } 
          />

          {/* More Screen */}
          <Route 
            path="/more" 
            element={
              <PatientMoreView
                patientProfile={profile}
                onLogout={() => {
                  if (onLogout) onLogout();
                  else navigate('/');
                }}
                onNavigate={(view) => {
                  if (view === 'profile') navigate('/patient/profile');
                  else if (view === 'caregivers') navigate('/patient/caregiver');
                  else if (view === 'messages') navigate('/patient/messages');
                  else if (view === 'progress') navigate('/patient/progress');
                  else navigate('/patient/profile');
                }}
              />
            } 
          />

          {/* Messages Screen */}
          <Route 
            path="/messages" 
            element={
              <PatientMessagesView
                patientProfile={profile}
                onBack={() => navigate('/patient/more')}
                onOpenChat={(_recipientId, _recipientName) => setShowChatModal(true)}
              />
            } 
          />

          {/* Progress Details Screen */}
          <Route 
            path="/progress" 
            element={
              <PatientProgressView
                gameResults={gameResults}
                reminders={reminders}
                onBack={() => navigate('/patient')}
                onNavigateToGames={() => navigate('/patient/games')}
              />
            } 
          />

          {/* Caregivers & Family Screen */}
          <Route 
            path="/caregiver" 
            element={
              <PatientCaregiverView
                patientProfile={profile}
                onBack={() => navigate('/patient/more')}
                onOpenChat={() => setShowChatModal(true)}
              />
            } 
          />

          {/* Profile Screen */}
          <Route 
            path="/profile" 
            element={
              <PatientProfileView
                patientProfile={profile}
                onBack={() => navigate('/patient/more')}
                onUpdateProfile={handleUpdateProfile}
              />
            } 
          />

          {/* Photo Memories Screen */}
          <Route 
            path="/memories" 
            element={
              <div className="max-w-md mx-auto px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate('/patient')}
                    className="text-xs font-bold text-[#1E7F53] hover:underline cursor-pointer"
                  >
                    ← Back to Home
                  </button>
                  <h2 className="text-base font-extrabold">Photo Memories</h2>
                </div>
                <MemoryLane isCaregiverView={false} />
              </div>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      </main>

      {/* Standalone Full-Screen Game Player View */}
      {activeGameItem && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in fade-in duration-200">
          <div className="min-h-screen pb-24">
            {activeGameItem.category === 'memory' && (
              <MemoryGame patientId={patientId} onClose={() => setActiveGameItem(null)} />
            )}
            {activeGameItem.category === 'attention' && (
              <AttentionGame patientId={patientId} onClose={() => setActiveGameItem(null)} />
            )}
            {activeGameItem.category === 'pattern' && (
              <PatternGame patientId={patientId} onClose={() => setActiveGameItem(null)} />
            )}
            {activeGameItem.category === 'routine' && (
              <RoutineGame patientId={patientId} onClose={() => setActiveGameItem(null)} />
            )}
          </div>
        </div>
      )}

      {/* Standalone Patient App Bottom Navigation */}
      <PatientBottomNav
        activeTab={getActiveTab()}
        onTabChange={handleBottomTabChange}
      />

    </div>
  );
};
