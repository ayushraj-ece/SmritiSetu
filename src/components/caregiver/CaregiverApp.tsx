import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { auth } from '../../services/firebase';
import type { PatientProfile, PatientReminder, GameResult, PatientNote, Prescription, AppNotification } from '../../types';

import { CaregiverTopHeader } from './ui/CaregiverTopHeader';
import { CaregiverBottomNav, type CaregiverTab } from './ui/CaregiverBottomNav';
import { CaregiverHomeView } from './views/CaregiverHomeView';
import { CaregiverPatientsView } from './views/CaregiverPatientsView';
import { CaregiverPatientDetailView } from './views/CaregiverPatientDetailView';
import { CaregiverMessagesView } from './views/CaregiverMessagesView';
import { CaregiverSettingsView } from './views/CaregiverSettingsView';

import { LogActivityModal } from './modals/LogActivityModal';
import { AddMedicationModal } from './modals/AddMedicationModal';
import { AddNoteModal } from './modals/AddNoteModal';
import { AddPatientModal } from './modals/AddPatientModal';
import { CaregiverChatModal } from './modals/CaregiverChatModal';
import { CaregiverReportModal } from './modals/CaregiverReportModal';
import { NotificationsModal } from '../common/NotificationsModal';

interface Props {
  patientId?: string;
  onLogout?: () => void;
}

export const CaregiverApp: React.FC<Props> = ({ patientId: initialPatientId, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePatientId, setActivePatientId] = useState<string>(initialPatientId || '');
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [primaryPatient, setPrimaryPatient] = useState<PatientProfile | null>(null);
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Modals state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string } | null>(null);

  // Subscribe to paired patients in real-time
  useEffect(() => {
    localStorage.removeItem('smritisetu_paired_patients');

    const caregiverUid = auth.currentUser?.uid || 'caregiver_user';

    const unsubPatients = dataService.subscribeCaregiverPatients(caregiverUid, (pairedList) => {
      setPatients(pairedList);

      if (pairedList.length > 0) {
        setPrimaryPatient(prev => {
          if (prev) {
            const found = pairedList.find(p => (p.patientId || p.id) === (prev.patientId || prev.id));
            if (found) return found;
          }
          return pairedList[0];
        });
        setActivePatientId(prev => prev || pairedList[0].patientId || pairedList[0].id);
      } else {
        setPrimaryPatient(null);
        setActivePatientId('');
        setReminders([]);
        setGameResults([]);
        setNotes([]);
        setPrescriptions([]);
      }
    });

    const handleProfileUpdate = async () => {
      if (activePatientId) {
        const updated = await dataService.searchPatientById(activePatientId);
        if (updated) setPrimaryPatient(updated);
      }
    };
    window.addEventListener('patientProfileUpdated', handleProfileUpdate);

    return () => {
      unsubPatients();
      window.removeEventListener('patientProfileUpdated', handleProfileUpdate);
    };
  }, [activePatientId]);

  // Subscribe to reminders, game results, notes, and prescriptions of active patient
  useEffect(() => {
    if (!activePatientId) {
      setReminders([]);
      setGameResults([]);
      setNotes([]);
      setPrescriptions([]);
      return;
    }
    const unsubRem = dataService.subscribeReminders(activePatientId, (data) => setReminders([...data]));
    const unsubRes = dataService.subscribeGameResults(activePatientId, (data) => setGameResults([...data]));
    const unsubNot = dataService.subscribeNotes(activePatientId, (data) => setNotes([...data]));
    const unsubRx = dataService.subscribePrescriptions(activePatientId, (data) => setPrescriptions([...data]));

    return () => {
      unsubRem();
      unsubRes();
      unsubNot();
      unsubRx();
    };
  }, [activePatientId]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const caregiverUid = auth.currentUser?.uid || 'caregiver_user';
    const targetId = activePatientId || caregiverUid;
    const unsubNotifs = dataService.subscribeUserNotifications(targetId, (list) => {
      setNotifications(list);
    });
    return () => unsubNotifs();
  }, [activePatientId]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Determine active tab from location pathname
  const getActiveTab = (): CaregiverTab => {
    const path = location.pathname;
    if (path.includes('/caregiver/patients')) return 'patients';
    if (path.includes('/caregiver/messages')) return 'messages';
    if (path.includes('/caregiver/settings')) return 'settings';
    return 'home';
  };

  const handleTabChange = (tab: CaregiverTab) => {
    if (tab === 'home') navigate('/caregiver');
    else if (tab === 'patients') navigate('/caregiver/patients');
    else if (tab === 'messages') navigate('/caregiver/messages');
    else if (tab === 'settings') navigate('/caregiver/settings');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Top Header */}
      <CaregiverTopHeader
        caregiverName={auth.currentUser?.displayName || 'Caregiver'}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenProfile={() => navigate('/caregiver/settings')}
      />

      {/* Routes Sub-Views */}
      <main>
        <Routes>
          {/* Caregiver Home View */}
          <Route
            path="/"
            element={
              <CaregiverHomeView
                caregiverName={auth.currentUser?.displayName || 'Caregiver'}
                primaryPatient={primaryPatient}
                reminders={reminders}
                gameResults={gameResults}
                onOpenLogActivity={() => setShowLogActivity(true)}
                onOpenAddMedication={() => setShowAddMedication(true)}
                onOpenAddNote={() => setShowAddNote(true)}
                onOpenManagePatient={() => navigate(`/caregiver/patients/${activePatientId}`)}
                onViewPatientDetail={(pid) => navigate(`/caregiver/patients/${pid}`)}
                onViewReports={() => setShowReportModal(true)}
                onViewAllActivities={() => navigate(`/caregiver/patients/${activePatientId}`)}
              />
            }
          />

          {/* Patients List View */}
          <Route
            path="/patients"
            element={
              <CaregiverPatientsView
                patients={patients}
                onSelectPatient={(pid) => {
                  setActivePatientId(pid);
                  navigate(`/caregiver/patients/${pid}`);
                }}
                onOpenAddPatient={() => setShowAddPatient(true)}
                onOpenCareCircle={() => navigate('/caregiver/settings')}
                onOpenAddMedication={(pid) => {
                  if (pid) setActivePatientId(pid);
                  setShowAddMedication(true);
                }}
              />
            }
          />

          {/* Patient Detail View */}
          <Route
            path="/patients/:pid"
            element={
              <CaregiverPatientDetailView
                patient={primaryPatient}
                reminders={reminders}
                gameResults={gameResults}
                notes={notes}
                prescriptions={prescriptions}
                onBack={() => navigate('/caregiver/patients')}
                onCallPatient={() => alert(`Calling ${primaryPatient?.name || 'Patient'}...`)}
                onMessagePatient={() => setChatRecipient({ id: activePatientId, name: primaryPatient?.name || 'Patient' })}
                onOpenLogActivity={() => setShowLogActivity(true)}
                onOpenAddMedication={() => setShowAddMedication(true)}
                onOpenAddNote={() => setShowAddNote(true)}
                onViewReports={() => setShowReportModal(true)}
              />
            }
          />

          {/* Messages View */}
          <Route
            path="/messages"
            element={
              <CaregiverMessagesView
                patients={patients}
                onOpenChat={(pid, name) => setChatRecipient({ id: pid, name })}
                onNewMessage={() => setShowAddPatient(true)}
              />
            }
          />

          {/* Settings View */}
          <Route
            path="/settings"
            element={
              <CaregiverSettingsView
                caregiverName={auth.currentUser?.displayName || 'Rahul Sharma'}
                caregiverEmail={auth.currentUser?.email || 'rahul.sharma@example.com'}
                onLogout={() => {
                  if (onLogout) onLogout();
                  else navigate('/');
                }}
              />
            }
          />

          {/* Fallback to Caregiver Home */}
          <Route path="*" element={<Navigate to="/caregiver" replace />} />
        </Routes>
      </main>

      {/* Fixed Bottom Navigation */}
      <CaregiverBottomNav
        activeTab={getActiveTab()}
        unreadMessagesCount={patients.reduce((acc, p) => acc + (dataService.hasUnreadMessages(p.patientId || p.id, 'caregiver') ? 1 : 0), 0)}
        onTabChange={handleTabChange}
      />

      {/* Action Modals */}
      <LogActivityModal
        patientId={activePatientId}
        isOpen={showLogActivity}
        onClose={() => setShowLogActivity(false)}
      />

      <AddMedicationModal
        patientId={activePatientId}
        isOpen={showAddMedication}
        onClose={() => setShowAddMedication(false)}
      />

      <AddNoteModal
        patientId={activePatientId}
        isOpen={showAddNote}
        onClose={() => setShowAddNote(false)}
      />

      <AddPatientModal
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSuccess={(newPid) => setActivePatientId(newPid)}
      />

      <CaregiverChatModal
        recipientId={chatRecipient?.id || activePatientId}
        recipientName={chatRecipient?.name || primaryPatient?.name || 'Patient'}
        isOpen={!!chatRecipient}
        onClose={() => setChatRecipient(null)}
      />

      <CaregiverReportModal
        patient={primaryPatient}
        patientName={primaryPatient?.name || 'Patient'}
        patientId={activePatientId}
        gameResults={gameResults}
        reminders={reminders}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        role="caregiver"
      />

    </div>
  );
};

