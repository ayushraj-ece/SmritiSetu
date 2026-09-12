import { auth } from './firebase';
import type { GameResult, PatientReminder, PatientProfile, AdaptiveEvaluation, CustomMemoryQuestion, PatientNote, Prescription, DoctorProfile, DoctorPairingRequest, Appointment, ClinicalNote, DoctorTask, AppNotification } from '../types';

const STORAGE_KEYS = {
  GAME_RESULTS: 'smritisetu_game_results',
  REMINDERS: 'smritisetu_reminders',
  PATIENT_PROFILES: 'smritisetu_patient_profiles',
  DIFFICULTY_LEVELS: 'smritisetu_difficulty_levels',
  EVALUATIONS: 'smritisetu_evaluations',
  CUSTOM_QUESTIONS: 'smritisetu_custom_questions',
  PATIENT_NOTES: 'smritisetu_patient_notes',
  PRESCRIPTIONS: 'smritisetu_prescriptions',
  DOCTOR_PROFILES: 'smritisetu_doctor_profiles',
  DOCTOR_PAIRING_REQUESTS: 'smritisetu_doctor_pairing_requests',
  APPOINTMENTS: 'smritisetu_appointments',
  CLINICAL_NOTES: 'smritisetu_clinical_notes',
  DOCTOR_TASKS: 'smritisetu_doctor_tasks',
  APP_NOTIFICATIONS: 'smritisetu_app_notifications'
};

const DEFAULT_DIFFICULTIES = {
  memory: 2,
  attention: 2,
  pattern: 2,
  routine: 2
};

export const offlineStorage = {
  // Doctor Profiles
  getDoctorProfile(uid?: string): DoctorProfile | null {
    if (!uid) return null;
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.DOCTOR_PROFILES}_${uid}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDoctorProfile(profile: DoctorProfile): void {
    if (!profile.uid) return;
    localStorage.setItem(`${STORAGE_KEYS.DOCTOR_PROFILES}_${profile.uid}`, JSON.stringify(profile));
  },

  // Doctor Pairing Requests (With 48-Hour Retention Auto-Expiration)
  getDoctorPairingRequests(doctorId?: string, patientId?: string): DoctorPairingRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_PAIRING_REQUESTS);
      const list: DoctorPairingRequest[] = data ? JSON.parse(data) : [];
      const EXPIRATION_48H_MS = 48 * 60 * 60 * 1000;
      const now = Date.now();

      // Auto-expire requests older than 48 hours
      const activeList = list.filter(r => {
        if (r.status === 'pending' && (now - r.createdAt > EXPIRATION_48H_MS)) {
          return false;
        }
        return true;
      });

      if (doctorId) {
        return activeList.filter(r => r.doctorId === doctorId);
      }
      if (patientId) {
        return activeList.filter(r => r.patientId === patientId);
      }
      return activeList;
    } catch {
      return [];
    }
  },

  saveDoctorPairingRequest(req: DoctorPairingRequest): void {
    const list = this.getDoctorPairingRequests();
    const updated = [req, ...list.filter(r => r.id !== req.id)];
    localStorage.setItem(STORAGE_KEYS.DOCTOR_PAIRING_REQUESTS, JSON.stringify(updated));
  },

  setDoctorPairingRequests(requests: DoctorPairingRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_PAIRING_REQUESTS, JSON.stringify(requests));
  },

  // Appointments
  getAppointments(doctorId?: string, patientId?: string): Appointment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      const list: Appointment[] = data ? JSON.parse(data) : [];
      if (doctorId && patientId) return list.filter(a => a.doctorId === doctorId && a.patientId === patientId);
      if (doctorId) return list.filter(a => a.doctorId === doctorId);
      if (patientId) return list.filter(a => a.patientId === patientId);
      return list;
    } catch {
      return [];
    }
  },

  saveAppointment(app: Appointment): void {
    const list = this.getAppointments();
    const updated = [app, ...list.filter(a => a.id !== app.id)];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
  },

  setAppointments(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  // Clinical Notes
  getClinicalNotes(doctorId?: string, patientId?: string): ClinicalNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICAL_NOTES);
      const list: ClinicalNote[] = data ? JSON.parse(data) : [];
      if (doctorId && patientId) return list.filter(n => n.doctorId === doctorId && n.patientId === patientId);
      if (doctorId) return list.filter(n => n.doctorId === doctorId);
      if (patientId) return list.filter(n => n.patientId === patientId);
      return list;
    } catch {
      return [];
    }
  },

  saveClinicalNote(note: ClinicalNote): void {
    const list = this.getClinicalNotes();
    const updated = [note, ...list.filter(n => n.id !== note.id)];
    localStorage.setItem(STORAGE_KEYS.CLINICAL_NOTES, JSON.stringify(updated));
  },

  setClinicalNotes(notes: ClinicalNote[]): void {
    localStorage.setItem(STORAGE_KEYS.CLINICAL_NOTES, JSON.stringify(notes));
  },

  // Doctor Tasks
  getDoctorTasks(patientId?: string): DoctorTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_TASKS);
      const list: DoctorTask[] = data ? JSON.parse(data) : [];
      if (patientId) return list.filter(t => t.patientId === patientId);
      return list;
    } catch {
      return [];
    }
  },

  saveDoctorTask(task: DoctorTask): void {
    const list = this.getDoctorTasks();
    const updated = [task, ...list.filter(t => t.id !== task.id)];
    localStorage.setItem(STORAGE_KEYS.DOCTOR_TASKS, JSON.stringify(updated));
  },

  setDoctorTasks(tasks: DoctorTask[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_TASKS, JSON.stringify(tasks));
  },

  // App Notifications
  getNotifications(filterId?: string): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_NOTIFICATIONS);
      const list: AppNotification[] = data ? JSON.parse(data) : [];
      if (filterId) {
        return list.filter(n => n.userId === filterId || n.patientId === filterId || n.caregiverUid === filterId || n.doctorId === filterId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveNotification(notification: AppNotification): void {
    const list = this.getNotifications();
    const updated = [notification, ...list.filter(n => n.id !== notification.id)];
    localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(list));
  },

  markAllNotificationsRead(filterId?: string): void {
    const list = this.getNotifications().map(n => {
      if (!filterId || n.userId === filterId || n.patientId === filterId || n.caregiverUid === filterId || n.doctorId === filterId) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(list));
  },

  // Get stored local prescriptions
  getPrescriptions(patientId?: string): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      const list: Prescription[] = data ? JSON.parse(data) : [];
      if (patientId) {
        const cleanTarget = patientId.trim().toUpperCase();
        return list.filter(p => {
          const pClean = (p.patientId || '').trim().toUpperCase();
          if (!pClean) return false;
          return pClean === cleanTarget || 
                 pClean.replace(/^AS-IND-/, '') === cleanTarget.replace(/^AS-IND-/, '') ||
                 cleanTarget.includes(pClean) || 
                 pClean.includes(cleanTarget);
        });
      }
      return list;
    } catch {
      return [];
    }
  },

  // Save prescription locally
  savePrescription(prescription: Prescription): void {
    const list = this.getPrescriptions();
    const updated = [prescription, ...list.filter(p => p.id !== prescription.id)];
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(updated));
  },

  // Delete prescription locally
  deletePrescription(id: string): void {
    const list = this.getPrescriptions().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list));
  },

  // Set prescriptions batch for specific patient
  setPrescriptionsForPatient(patientId: string, prescriptions: Prescription[]): void {
    const cleanTarget = patientId.trim().toUpperCase();
    const list = this.getPrescriptions().filter(p => {
      const pClean = (p.patientId || '').trim().toUpperCase();
      return pClean !== cleanTarget && pClean.replace(/^AS-IND-/, '') !== cleanTarget.replace(/^AS-IND-/, '');
    });
    const updated = [...prescriptions, ...list];
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(updated));
  },
  // Get stored local notes
  getNotes(patientId?: string): PatientNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENT_NOTES);
      const list: PatientNote[] = data ? JSON.parse(data) : [];
      if (patientId) {
        return list.filter(n => n.patientId === patientId);
      }
      return list;
    } catch {
      return [];
    }
  },

  // Save note locally
  saveNote(note: PatientNote): void {
    const notes = this.getNotes();
    const updated = [note, ...notes.filter(n => n.id !== note.id)];
    localStorage.setItem(STORAGE_KEYS.PATIENT_NOTES, JSON.stringify(updated));
  },

  // Set notes batch for specific patient
  setNotesForPatient(patientId: string, notes: PatientNote[]): void {
    const list = this.getNotes().filter(n => n.patientId !== patientId);
    const updated = [...notes, ...list];
    localStorage.setItem(STORAGE_KEYS.PATIENT_NOTES, JSON.stringify(updated));
  },
  // Get stored local game results (filtered by patientId if supplied)
  getGameResults(patientId?: string): GameResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_RESULTS);
      const list: GameResult[] = data ? JSON.parse(data) : [];
      if (patientId) {
        return list.filter(r => r.patientId === patientId);
      }
      return list;
    } catch {
      return [];
    }
  },

  // Save game result locally
  saveGameResult(result: GameResult): void {
    const results = this.getGameResults();
    results.unshift({ ...result, synced: result.synced ?? false });
    localStorage.setItem(STORAGE_KEYS.GAME_RESULTS, JSON.stringify(results));
  },

  // Update game result sync state
  markResultsSynced(ids: string[]): void {
    const results = this.getGameResults().map(r => {
      if (r.id && ids.includes(r.id)) {
        return { ...r, synced: true };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEYS.GAME_RESULTS, JSON.stringify(results));
  },

  // Get local reminders (filtered by patientId if supplied)
  getReminders(patientId?: string): PatientReminder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      const list: PatientReminder[] = data ? JSON.parse(data) : [];
      if (patientId) {
        return list.filter(r => r.patientId === patientId);
      }
      return list;
    } catch {
      return [];
    }
  },

  // Set reminders batch
  setReminders(reminders: PatientReminder[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  // Add a new reminder locally
  addReminder(reminder: PatientReminder): PatientReminder[] {
    const reminders = this.getReminders();
    const updated = [reminder, ...reminders];
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
    return updated;
  },

  // Toggle reminder completion offline
  toggleReminderCompleted(reminderId: string, completed: boolean): PatientReminder[] {
    const reminders = this.getReminders();
    const updated = reminders.map(r => {
      if (r.id === reminderId) {
        return {
          ...r,
          completed,
          completedAt: completed ? Date.now() : undefined,
          synced: false
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
    return updated;
  },

  // Delete reminder offline
  deleteReminder(reminderId: string): PatientReminder[] {
    const reminders = this.getReminders().filter(r => r.id !== reminderId);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    return reminders;
  },

  // Get Adaptive Difficulty Levels
  getDifficultyLevels(_patientId?: string): Record<string, number> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIFFICULTY_LEVELS);
      return data ? JSON.parse(data) : { ...DEFAULT_DIFFICULTIES };
    } catch {
      return { ...DEFAULT_DIFFICULTIES };
    }
  },

  // Save Adaptive Difficulty Level
  saveDifficultyLevel(category: string, level: number): void {
    const current = this.getDifficultyLevels();
    current[category] = level;
    localStorage.setItem(STORAGE_KEYS.DIFFICULTY_LEVELS, JSON.stringify(current));
  },

  // Adaptive evaluations log
  getEvaluations(patientId?: string): AdaptiveEvaluation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      const list: AdaptiveEvaluation[] = data ? JSON.parse(data) : [];
      if (patientId) {
        return list.filter(e => e.patientId === patientId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveEvaluation(evalData: AdaptiveEvaluation): void {
    const evals = this.getEvaluations();
    evals.unshift(evalData);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  },

  // Patient Profile Local Storage (Strictly indexed per patientId)
  getPatientProfile(patientId?: string): PatientProfile | null {
    if (!patientId) return null;
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.PATIENT_PROFILES}_${patientId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  savePatientProfile(profile: PatientProfile): void {
    if (!profile.patientId) return;
    localStorage.setItem(`${STORAGE_KEYS.PATIENT_PROFILES}_${profile.patientId}`, JSON.stringify(profile));
  },

  // Custom Memory Photo Questions
  getCustomQuestions(patientId?: string): CustomMemoryQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      const list: CustomMemoryQuestion[] = data ? JSON.parse(data) : [];
      if (patientId) {
        return list.filter(q => q.patientId === patientId || q.patientId === 'all');
      }
      return list;
    } catch {
      return [];
    }
  },

  saveCustomQuestion(question: CustomMemoryQuestion): void {
    const list = this.getCustomQuestions();
    list.unshift(question);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
  },

  deleteCustomQuestion(id: string): void {
    const list = this.getCustomQuestions().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
  },

  // Caregiver Profile Storage (Single Source of Truth)
  getCaregiverProfile(): { name: string; email: string; phone: string; relation: string; caregiverUid: string } {
    let savedProfile: any = null;
    try {
      const data = localStorage.getItem('smritisetu_caregiver_profile');
      if (data) {
        savedProfile = JSON.parse(data);
      }
    } catch {}

    const u = auth.currentUser;
    const isDoc = u?.displayName?.startsWith('Dr.') || u?.email?.includes('doctor') || u?.email?.includes('aiims');

    if (u && !isDoc) {
      const name = (savedProfile?.name && !savedProfile.name.startsWith('Dr.')) ? savedProfile.name : (u.displayName || (u.email ? u.email.split('@')[0] : 'Caregiver'));
      const email = savedProfile?.email || u.email || 'caregiver@smritisetu.org';
      const phone = savedProfile?.phone || '+91 98765 43210';
      const relation = savedProfile?.relation || 'Caregiver';
      return {
        name,
        email,
        phone,
        relation,
        caregiverUid: u.uid
      };
    }

    if (savedProfile && savedProfile.name && !savedProfile.name.startsWith('Dr.')) {
      return {
        name: savedProfile.name,
        email: savedProfile.email || 'caregiver@smritisetu.org',
        phone: savedProfile.phone || '+91 98765 43210',
        relation: savedProfile.relation || 'Caregiver',
        caregiverUid: savedProfile.caregiverUid || 'caregiver_user'
      };
    }

    return {
      name: 'Caregiver',
      email: 'caregiver@smritisetu.org',
      phone: '+91 98765 43210',
      relation: 'Caregiver',
      caregiverUid: 'caregiver_user'
    };
  },

  saveCaregiverProfile(profile: { name: string; email?: string; phone: string; relation: string; caregiverUid?: string }): void {
    const existing = this.getCaregiverProfile();
    const updated = {
      ...existing,
      ...profile,
      name: profile.name.trim(),
      email: profile.email ? profile.email.trim() : existing.email,
      phone: profile.phone.trim(),
      relation: profile.relation.trim()
    };
    localStorage.setItem('smritisetu_caregiver_profile', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caregiverProfileUpdated'));
    }
  },

  // Clear all application local storage
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    // Clear keyed patient profiles
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('smritisetu_') || key.startsWith('caregiver_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
