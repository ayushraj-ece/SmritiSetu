import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { offlineStorage } from './offlineStorage';
import type { GameResult, PatientReminder, PatientProfile, AdaptiveEvaluation, PairingRequest, ChatMessage, AppNotification, PatientNote, Prescription, DoctorProfile, DoctorPairingRequest, Appointment, ClinicalNote, DoctorTask } from '../types';

export const dataService = {
  // Add Doctor Prescription
  async addPrescription(
    patientIdOrRx: string | (Partial<Prescription> & { patientId?: string }),
    rxDataArg?: any
  ): Promise<Prescription> {
    const rxData = typeof patientIdOrRx === 'object' ? patientIdOrRx : (rxDataArg || {});
    const cleanId = (typeof patientIdOrRx === 'string' ? patientIdOrRx : patientIdOrRx.patientId || 'ASM58291').trim().toUpperCase();
    
    const newRx: Prescription = {
      id: rxData.id || `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: cleanId,
      doctorId: rxData.doctorId,
      medicineName: rxData.medicineName || 'Medication',
      dosage: rxData.dosage || '1 Tablet',
      time: rxData.time || '08:00 AM',
      daysOfWeek: Array.isArray(rxData.daysOfWeek) && rxData.daysOfWeek.length > 0 ? rxData.daysOfWeek : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      instructions: rxData.instructions || 'Take with water after food',
      prescribedBy: rxData.prescribedBy || rxData.doctorName || 'Attending Doctor',
      hospitalName: rxData.hospitalName || rxData.doctorHospital || '',
      createdAt: rxData.createdAt || Date.now()
    };

    offlineStorage.savePrescription(newRx);

    // Automatically create a corresponding medication alarm/reminder
    await this.addMedication(cleanId, {
      name: `${newRx.medicineName} (${newRx.dosage})`,
      time: newRx.time,
      repeatPattern: newRx.daysOfWeek.length === 7 || newRx.daysOfWeek.includes('Daily') ? 'Daily' : 'Weekly',
      scheduledBy: newRx.prescribedBy
    });

    // Update active medications summary in patient profile
    const allRx = offlineStorage.getPrescriptions(cleanId).filter(p => !p.id.startsWith('rx_demo_'));
    const rxSummary = allRx.map(r => `${r.medicineName} (${r.dosage})`).join(', ');
    await this.updatePatientMedicalInfo(cleanId, { currentMedications: rxSummary }).catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: cleanId }));
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: cleanId }));
    }

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'prescriptions', newRx.id), newRx);
      } catch (err) {
        console.warn('Firestore addPrescription failed, saved locally:', err);
      }
    }

    return newRx;
  },

  // Update Prescription
  async updatePrescription(idOrRx: string | Prescription, rxDataArg?: Partial<Prescription>): Promise<void> {
    let updated: Prescription;
    if (typeof idOrRx === 'string') {
      const allRx = offlineStorage.getPrescriptions();
      const existing = allRx.find(r => r.id === idOrRx);
      updated = {
        ...(existing || { id: idOrRx, patientId: 'ASM58291', medicineName: '', dosage: '', time: '', daysOfWeek: [], prescribedBy: '', hospitalName: '', createdAt: Date.now() }),
        ...(rxDataArg || {})
      };
    } else {
      updated = idOrRx;
    }

    offlineStorage.savePrescription(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: updated.patientId }));
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: updated.patientId }));
    }
    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'prescriptions', updated.id), updated, { merge: true });
      } catch (err) {
        console.warn('Firestore updatePrescription failed:', err);
      }
    }
  },

  // Delete Prescription
  async deletePrescription(id: string): Promise<void> {
    const allRx = offlineStorage.getPrescriptions();
    const targetRx = allRx.find(p => p.id === id);

    offlineStorage.deletePrescription(id);
    if (typeof window !== 'undefined' && targetRx) {
      window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: targetRx.patientId }));
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: targetRx.patientId }));
    }

    if (navigator.onLine) {
      try {
        await deleteDoc(doc(db, 'prescriptions', id));
      } catch (err) {
        console.warn('Firestore deletePrescription failed:', err);
      }
    }

    // Clean up corresponding medication reminder if one was created
    if (targetRx) {
      const patientId = targetRx.patientId;
      const reminders = offlineStorage.getReminders(patientId);
      const matchingRem = reminders.find(r => 
        r.title.toLowerCase().includes(targetRx.medicineName.toLowerCase()) || 
        r.id.includes(id)
      );
      if (matchingRem) {
        await this.deleteReminder(matchingRem.id);
      }
    }
  },

  // Subscribe to Patient Prescriptions
  subscribePrescriptions(patientId: string, callback: (prescriptions: Prescription[]) => void): () => void {
    if (!patientId) {
      callback([]);
      return () => {};
    }

    const cleanId = patientId.trim().toUpperCase();
    const cached = offlineStorage.getPrescriptions(cleanId).filter(p => !p.id.startsWith('rx_demo_'));
    callback(cached);

    const handleUpdate = () => {
      const updated = offlineStorage.getPrescriptions(cleanId).filter(p => !p.id.startsWith('rx_demo_'));
      callback(updated);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('prescriptionsUpdated', handleUpdate);
    }

    if (!navigator.onLine) {
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('prescriptionsUpdated', handleUpdate);
        }
      };
    }

    const q = query(collection(db, 'prescriptions'), where('patientId', '==', cleanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveRx: Prescription[] = [];
      snapshot.forEach(docSnap => {
        const rx = { ...docSnap.data(), id: docSnap.id } as Prescription;
        if (!rx.id.startsWith('rx_demo_')) {
          liveRx.push(rx);
        }
      });
      liveRx.sort((a, b) => b.createdAt - a.createdAt);

      offlineStorage.setPrescriptionsForPatient(cleanId, liveRx);
      callback(liveRx);
    }, () => {
      callback(offlineStorage.getPrescriptions(cleanId).filter(p => !p.id.startsWith('rx_demo_')));
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('prescriptionsUpdated', handleUpdate);
      }
      unsubscribe();
    };
  },
  // Add Note (Caregiver or Doctor)
  async addNote(patientId: string, noteData: { title?: string; body: string; writtenBy: string; role?: 'caregiver' | 'doctor' | 'system' }): Promise<PatientNote> {
    const cleanId = patientId.trim().toUpperCase();
    const newNote: PatientNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: cleanId,
      title: noteData.title || (noteData.role === 'doctor' ? 'Doctor Guidance' : 'Caregiver Observation'),
      category: noteData.title || 'Observation',
      body: noteData.body,
      writtenBy: noteData.writtenBy,
      role: noteData.role || 'caregiver',
      timestamp: Date.now()
    };

    offlineStorage.saveNote(newNote);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'patientNotes', newNote.id), newNote);
      } catch (err) {
        console.warn('Firestore addNote failed, saved locally:', err);
      }
    }

    return newNote;
  },

  // Subscribe to Patient Notes
  subscribeNotes(patientId: string, callback: (notes: PatientNote[]) => void): () => void {
    if (!patientId) {
      callback([]);
      return () => {};
    }

    const cleanId = patientId.trim().toUpperCase();
    const initKey = `smritisetu_notes_seeded_${cleanId}`;
    const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(initKey) : 'true';
    const cached = offlineStorage.getNotes(cleanId);
    
    // Default demo notes if empty and not seeded
    if (cached.length === 0 && cleanId === 'ASM58291' && !isSeeded) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(initKey, 'true');
      }
      const defaultNotes: PatientNote[] = [
        {
          id: 'note_default_1',
          patientId: 'ASM58291',
          title: 'Caregiver Observation',
          category: 'Observation',
          body: 'Patient shows high focus during morning pattern & memory tests. Prefers Assamese language prompts.',
          writtenBy: 'Anita Sharma (Caregiver)',
          role: 'caregiver',
          timestamp: Date.now() - 3600000 * 24
        }
      ];
      defaultNotes.forEach(n => offlineStorage.saveNote(n));
      callback(defaultNotes);
    } else {
      if (typeof window !== 'undefined' && !isSeeded) {
        localStorage.setItem(initKey, 'true');
      }
      callback(cached);
    }

    if (!navigator.onLine) return () => {};

    const q = query(collection(db, 'patientNotes'), where('patientId', '==', cleanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveNotes: PatientNote[] = [];
      snapshot.forEach(docSnap => {
        liveNotes.push({ ...docSnap.data(), id: docSnap.id } as PatientNote);
      });
      liveNotes.sort((a, b) => b.timestamp - a.timestamp);

      offlineStorage.setNotesForPatient(cleanId, liveNotes);
      callback(liveNotes);
    }, () => {
      callback(offlineStorage.getNotes(cleanId));
    });

    return unsubscribe;
  },

  // Update Medical Conditions & Attending Doctor info
  async updatePatientMedicalInfo(patientId: string, info: { 
    knownConditions?: string; 
    medicalConditions?: string;
    currentMedications?: string;
    doctorHospital?: string; 
    doctorId?: string; 
    doctorName?: string;
    emergencyContact?: string;
    isDoctorLinked?: boolean;
    stage?: string;
  }): Promise<void> {
    const cleanId = patientId.trim().toUpperCase();
    const existing = offlineStorage.getPatientProfile(cleanId) || await this.searchPatientById(cleanId);
    
    const updatedProf: PatientProfile = {
      ...(existing || {
        id: cleanId,
        patientId: cleanId,
        name: 'Patient',
        age: 70,
        state: 'Assam',
        preferredLanguage: 'as',
        createdAt: Date.now()
      }),
      ...(info.knownConditions !== undefined && { knownConditions: info.knownConditions }),
      ...(info.medicalConditions !== undefined && { medicalConditions: info.medicalConditions, knownConditions: info.medicalConditions }),
      ...(info.doctorHospital !== undefined && { doctorHospital: info.doctorHospital }),
      ...(info.doctorId !== undefined && { doctorId: info.doctorId }),
      ...(info.doctorName !== undefined && { doctorName: info.doctorName }),
      ...(info.emergencyContact !== undefined && { emergencyContact: info.emergencyContact }),
      ...(info.isDoctorLinked !== undefined && { isDoctorLinked: info.isDoctorLinked }),
      ...(info.stage !== undefined && { stage: info.stage })
    };

    offlineStorage.savePatientProfile(updatedProf);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'patients', cleanId), updatedProf, { merge: true });
      } catch (err) {
        console.warn('Firestore update patient medical info failed:', err);
      }
    }

    window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: cleanId }));
  },

  // Update Caregiver Profile & sync across paired patients
  async updateCaregiverProfile(profileData: {
    name: string;
    phone: string;
    relation: string;
    caregiverUid?: string;
  }): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smritisetu_caregiver_profile', JSON.stringify(profileData));
    }

    const cUid = profileData.caregiverUid || auth.currentUser?.uid || 'caregiver_user';
    const pairedPatients = await this.getCaregiverPatients(cUid);

    for (const p of pairedPatients) {
      const pId = p.patientId || p.id;
      const updatedProf: PatientProfile = {
        ...p,
        caregiverName: profileData.name,
        caregiverPhone: profileData.phone,
        caregiverRelation: profileData.relation,
        emergencyContact: profileData.phone
      };
      offlineStorage.savePatientProfile(updatedProf);
      if (navigator.onLine) {
        setDoc(doc(db, 'patients', pId), updatedProf, { merge: true }).catch(() => {});
      }
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: pId }));
    }
  },
  // Save game result (Offline-first real-time)
  async saveGameResult(result: GameResult): Promise<void> {
    if (!result.patientId) return;

    // Save locally first
    offlineStorage.saveGameResult(result);

    // Sync to Firestore if online
    if (navigator.onLine) {
      try {
        await addDoc(collection(db, 'gameResults'), {
          patientId: result.patientId,
          gameCategory: result.gameCategory,
          difficultyLevel: result.difficultyLevel,
          score: result.score,
          accuracyPercentage: result.accuracyPercentage,
          responseTimeSeconds: result.responseTimeSeconds,
          timestamp: result.timestamp || Date.now()
        });
      } catch (err) {
        console.warn('Firestore game result write failed, stored locally:', err);
      }
    }
  },

  // Real-time Firestore subscription for Game Results
  subscribeGameResults(patientId: string, callback: (results: GameResult[]) => void): () => void {
    if (!patientId) {
      callback([]);
      return () => {};
    }

    // Immediately emit local offline cache for fast instant rendering
    const cached = offlineStorage.getGameResults(patientId);
    callback(cached);

    if (!navigator.onLine) {
      return () => {};
    }

    // Live Mode: Real Firestore onSnapshot listener
    const q = query(collection(db, 'gameResults'), where('patientId', '==', patientId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveResults: GameResult[] = [];
      snapshot.forEach(doc => {
        liveResults.push({ id: doc.id, ...doc.data() } as GameResult);
      });

      // Sort newest first
      liveResults.sort((a, b) => b.timestamp - a.timestamp);

      // Merge local offline unsynced items if any
      const merged = [...liveResults];
      cached.forEach(c => {
        if (!merged.find(m => m.timestamp === c.timestamp)) {
          merged.unshift(c);
        }
      });

      callback(merged.sort((a, b) => b.timestamp - a.timestamp));
    }, (err) => {
      console.warn('Firestore results subscription fallback to offline cache:', err);
      callback(offlineStorage.getGameResults(patientId));
    });

    return unsubscribe;
  },

  // Real-time Firestore subscription for Reminders
  subscribeReminders(patientId: string, callback: (reminders: PatientReminder[]) => void): () => void {
    if (!patientId) {
      callback([]);
      return () => {};
    }

    // Emit local cache immediately
    const cached = offlineStorage.getReminders(patientId);
    callback(cached);

    if (!navigator.onLine) {
      return () => {};
    }

    // Live Firestore listener
    const q = query(collection(db, 'reminders'), where('patientId', '==', patientId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveReminders: PatientReminder[] = [];
      snapshot.forEach(docSnap => {
        liveReminders.push({ ...docSnap.data(), id: docSnap.id } as PatientReminder);
      });
      offlineStorage.setReminders(liveReminders);
      callback(liveReminders);
    }, () => {
      callback(offlineStorage.getReminders(patientId));
    });

    return unsubscribe;
  },

  // Add new reminder (Offline-first real-time)
  async addReminder(reminder: PatientReminder): Promise<void> {
    offlineStorage.addReminder(reminder);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'reminders', reminder.id), reminder);
      } catch (err) {
        console.warn('Firestore add reminder failed, saved locally:', err);
      }
    }
  },

  // Add Medication / Scheduled Reminder for Patient
  async addMedication(patientId: string, medData: { name: string; time: string; repeatPattern?: 'Daily' | 'Weekly' | 'Once'; soundOption?: 'Gentle Chime' | 'Voice Alarm' | 'Loud Alarm'; scheduledBy?: string }): Promise<PatientReminder> {
    const cleanId = patientId.trim().toUpperCase();
    const newRem: PatientReminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: cleanId,
      type: 'medicine',
      title: medData.name,
      time: medData.time,
      repeatPattern: medData.repeatPattern || 'Daily',
      soundOption: medData.soundOption || 'Gentle Chime',
      completed: false
    };

    await this.addReminder(newRem);

    // Send notification alert
    await this.sendNotification({
      userId: cleanId,
      patientId: cleanId,
      title: 'New Reminder Scheduled ⏰',
      message: `${medData.scheduledBy || 'Caregiver'} scheduled: "${medData.name}" for ${medData.time}.`,
      type: 'medication_alert',
      timestamp: Date.now(),
      read: false
    });

    return newRem;
  },

  // Toggle Reminder Completion
  async toggleReminder(reminderId: string, completed: boolean): Promise<void> {
    offlineStorage.toggleReminderCompleted(reminderId, completed);

    if (navigator.onLine) {
      try {
        const remRef = doc(db, 'reminders', reminderId);
        await updateDoc(remRef, {
          completed,
          completedAt: completed ? Date.now() : null
        });
      } catch (err) {
        console.warn('Firestore reminder toggle failed, saved locally:', err);
      }
    }
  },

  // Delete Reminder
  async deleteReminder(reminderId: string): Promise<void> {
    offlineStorage.deleteReminder(reminderId);

    if (navigator.onLine) {
      try {
        await deleteDoc(doc(db, 'reminders', reminderId));
      } catch (err) {
        console.warn('Firestore delete reminder failed, saved locally:', err);
      }
    }
  },

  // Save Adaptive AI Evaluation
  async saveEvaluation(evalData: AdaptiveEvaluation): Promise<void> {
    offlineStorage.saveEvaluation(evalData);
    if (navigator.onLine) {
      try {
        await addDoc(collection(db, 'evaluations'), evalData);
      } catch (err) {
        console.warn('Evaluation write failed:', err);
      }
    }
  },

  enrichPatientProfileWithDoctor(prof: PatientProfile | null): PatientProfile | null {
    if (!prof) return null;
    const cleanId = (prof.patientId || prof.id || '').trim().toUpperCase();
    if (!cleanId) return prof;

    // Check local storage accepted doctor pairing requests
    const docReqs = offlineStorage.getDoctorPairingRequests();
    const acceptedReq = docReqs.find(r => r.patientId === cleanId && r.status === 'accepted');
    if (acceptedReq) {
      prof.doctorId = acceptedReq.doctorId || prof.doctorId || 'doc_default';
      prof.doctorName = acceptedReq.doctorName || prof.doctorName;
      prof.doctorHospital = acceptedReq.doctorHospital || prof.doctorHospital;
      prof.isDoctorLinked = true;
      offlineStorage.savePatientProfile(prof);
    }
    return prof;
  },

  // Search real Firestore Patient by Patient ID Code
  async searchPatientById(patientId: string): Promise<PatientProfile | null> {
    if (!patientId || !patientId.trim()) return null;
    const cleanId = patientId.trim().toUpperCase();

    // Reject legacy residue IDs
    if (cleanId.startsWith('SS-IND-') || cleanId.startsWith('MC-IND-') || cleanId.startsWith('SS-') || cleanId === 'DEMO_PATIENT') {
      return null;
    }

    // Check local storage first for quick display
    const cachedProf = offlineStorage.getPatientProfile(cleanId);

    if (navigator.onLine) {
      try {
        // 1. Direct doc lookup by patientId key in patients collection
        const snap = await getDoc(doc(db, 'patients', cleanId));
        if (snap.exists()) {
          const prof = snap.data() as PatientProfile;
          offlineStorage.savePatientProfile(prof);
          return this.enrichPatientProfileWithDoctor(prof);
        }

        // 2. Query patients collection by patientId field
        const qPatients = query(collection(db, 'patients'), where('patientId', '==', cleanId));
        const querySnapPatients = await getDocs(qPatients);
        if (!querySnapPatients.empty) {
          const prof = querySnapPatients.docs[0].data() as PatientProfile;
          offlineStorage.savePatientProfile(prof);
          return this.enrichPatientProfileWithDoctor(prof);
        }

        // 3. Query users collection as fallback
        const qUsers = query(collection(db, 'users'), where('patientId', '==', cleanId));
        const querySnapUsers = await getDocs(qUsers);
        if (!querySnapUsers.empty) {
          const uData = querySnapUsers.docs[0].data();
          const prof: PatientProfile = {
            id: uData.uid || cleanId,
            patientId: uData.patientId || cleanId,
            name: uData.displayName || uData.name || 'Patient',
            email: uData.email,
            phone: uData.phone,
            age: uData.age || 72,
            gender: uData.gender || 'Male',
            state: uData.state || 'Assam',
            preferredLanguage: uData.preferredLanguage || 'as',
            knownConditions: uData.knownConditions || 'Mild Cognitive Impairment (MCI)',
            currentMedications: uData.currentMedications || '',
            doctorHospital: uData.doctorHospital || '',
            emergencyContact: uData.emergencyContact || '+91 98765 43210',
            createdAt: uData.createdAt || Date.now()
          };
          await setDoc(doc(db, 'patients', cleanId), prof, { merge: true }).catch(() => {});
          offlineStorage.savePatientProfile(prof);
          return this.enrichPatientProfileWithDoctor(prof);
        }
      } catch (err) {
        console.warn('Firestore patient lookup error:', err);
      }
    }

    // Default primary record for ASM58291 if missing in DB
    if (cleanId === 'ASM58291') {
      const maheshProf: PatientProfile = {
        id: 'ASM58291',
        patientId: 'ASM58291',
        name: 'Mahesh',
        age: 72,
        gender: 'Male',
        state: 'Assam',
        preferredLanguage: 'as',
        knownConditions: 'Mild Cognitive Impairment (MCI), Mild Hypertension',
        currentMedications: '',
        doctorHospital: '',
        caregiverName: 'Pratham',
        caregiverPhone: '+91 98765 43210',
        caregiverRelation: 'Son',
        emergencyContact: '+91 98765 43210',
        notes: 'Patient shows high focus during morning pattern & memory tests. Prefers Assamese language prompts.',
        createdAt: Date.now()
      };
      if (navigator.onLine) {
        setDoc(doc(db, 'patients', 'ASM58291'), maheshProf, { merge: true }).catch(() => {});
      }
      offlineStorage.savePatientProfile(maheshProf);
      return this.enrichPatientProfileWithDoctor(maheshProf);
    }

    return this.enrichPatientProfileWithDoctor(cachedProf || null);
  },

  // Local Storage Paired Patients Cache
  getLocalPairedPatientIds(): string[] {
    if (typeof window === 'undefined') return [];
    const set = new Set<string>();
    const saved = localStorage.getItem('smritisetu_paired_patients');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          list.forEach(id => {
            const upper = String(id).trim().toUpperCase();
            if (!upper.startsWith('SS-IND-') && !upper.startsWith('MC-IND-') && !upper.startsWith('SS-')) {
              set.add(upper);
            }
          });
        }
      } catch {}
    }
    return Array.from(set);
  },

  addLocalPairedPatient(patientId: string): void {
    if (typeof window === 'undefined') return;
    const current = this.getLocalPairedPatientIds();
    const cleanId = patientId.trim().toUpperCase();
    if (!cleanId.startsWith('SS-IND-') && !cleanId.startsWith('MC-IND-') && !cleanId.startsWith('SS-') && !current.includes(cleanId)) {
      const updated = [cleanId, ...current];
      localStorage.setItem('smritisetu_paired_patients', JSON.stringify(updated));
    }
  },

  // Caregiver links patient by Patient ID
  async linkCaregiverToPatient(caregiverUid: string, patientId: string): Promise<boolean> {
    try {
      const cleanId = patientId.trim().toUpperCase();
      if (cleanId.startsWith('SS-IND-') || cleanId.startsWith('MC-IND-')) return false;

      const linkRef = doc(db, 'caregiverLinks', `${caregiverUid}_${cleanId}`);
      await setDoc(linkRef, {
        caregiverUid,
        patientId: cleanId,
        linkedAt: Date.now()
      });
      this.addLocalPairedPatient(cleanId);
      return true;
    } catch {
      return false;
    }
  },

  // Send Caregiver -> Patient Pairing Request (by 5-digit Patient ID)
  async sendPairingRequest(patientId: string, caregiverUid: string, caregiverName: string, caregiverEmail?: string): Promise<void> {
    if (!patientId) return;
    const cleanId = patientId.trim().toUpperCase();
    if (cleanId.startsWith('SS-IND-') || cleanId.startsWith('MC-IND-')) return;

    // Ensure patient record exists in database
    await this.searchPatientById(cleanId);

    // Create pairing request doc in Firestore
    const reqData = {
      patientId: cleanId,
      caregiverUid,
      caregiverName: caregiverName || 'Caregiver',
      caregiverEmail: caregiverEmail || '',
      status: 'pending',
      timestamp: Date.now()
    };

    if (navigator.onLine) {
      try {
        await addDoc(collection(db, 'pairing_requests'), reqData);
      } catch (err) {
        console.warn('Firestore write pairing request error:', err);
      }
    }

    // Save pending request to local storage so it displays offline as well
    try {
      const stored = localStorage.getItem('smritisetu_pending_requests');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.some((r: any) => r.patientId === cleanId && r.caregiverUid === caregiverUid && r.status === 'pending')) {
        list.push({ id: `req_${Date.now()}`, ...reqData });
        localStorage.setItem('smritisetu_pending_requests', JSON.stringify(list));
      }
    } catch {}
  },

  // Real-time listener for pending pairing requests for a patient
  subscribePairingRequests(patientId: string, callback: (requests: PairingRequest[]) => void) {
    if (!patientId) return () => {};
    const cleanId = patientId.trim().toUpperCase();
    if (cleanId.startsWith('SS-IND-') || cleanId.startsWith('MC-IND-')) {
      callback([]);
      return () => {};
    }

    const getLocalPending = (): PairingRequest[] => {
      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list: PairingRequest[] = stored ? JSON.parse(stored) : [];
        return list.filter(r => r.patientId === cleanId && r.status === 'pending');
      } catch {
        return [];
      }
    };

    if (!navigator.onLine) {
      callback(getLocalPending());
      return () => {};
    }

    const q = query(
      collection(db, 'pairing_requests'),
      where('patientId', '==', cleanId),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: PairingRequest[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as PairingRequest);
      });
      callback(list);
    }, () => callback(getLocalPending()));
    return unsub;
  },

  // Respond to pairing request (accept / decline)
  async respondToPairingRequest(requestId: string, status: 'accepted' | 'declined', patientId: string, caregiverUid: string, caregiverName?: string): Promise<void> {
    try {
      const cleanId = patientId.trim().toUpperCase();

      if (navigator.onLine) {
        // Update matching pending doc in Firestore pairing_requests collection
        try {
          if (requestId && !requestId.startsWith('req_')) {
            await updateDoc(doc(db, 'pairing_requests', requestId), { status });
          } else {
            const q = query(
              collection(db, 'pairing_requests'),
              where('patientId', '==', cleanId),
              where('caregiverUid', '==', caregiverUid),
              where('status', '==', 'pending')
            );
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              await updateDoc(doc(db, 'pairing_requests', d.id), { status });
            }
          }
        } catch (err) {
          console.warn('Update pairing request in Firestore failed:', err);
        }
      }

      // Update local storage pending list
      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list = stored ? JSON.parse(stored) : [];
        const updated = list.map((r: any) => (r.id === requestId || (r.patientId === cleanId && r.caregiverUid === caregiverUid)) ? { ...r, status } : r);
        localStorage.setItem('smritisetu_pending_requests', JSON.stringify(updated.filter((r: any) => r.status === 'pending')));
      } catch {}

      if (status === 'accepted') {
        // 1. Create link in caregiverLinks collection
        const linkRef = doc(db, 'caregiverLinks', `${caregiverUid}_${cleanId}`);
        await setDoc(linkRef, {
          caregiverUid,
          caregiverName: caregiverName || 'Caregiver',
          patientId: cleanId,
          linkedAt: Date.now()
        }).catch(() => {});

        // 2. Update patient profile doc with caregiverId
        const patientRef = doc(db, 'patients', cleanId);
        await updateDoc(patientRef, {
          caregiverId: caregiverUid
        }).catch(() => {});

        this.addLocalPairedPatient(cleanId);
      }
    } catch (err) {
      console.warn('Respond to pairing request error:', err);
    }
  },

  // Check if Caregiver and Patient are paired
  async checkPairingStatus(caregiverUid: string, patientId: string): Promise<'paired' | 'pending' | 'none'> {
    try {
      const cleanId = patientId.trim().toUpperCase();
      if (cleanId.startsWith('SS-IND-') || cleanId.startsWith('MC-IND-')) return 'none';
      const targetUids = Array.from(new Set([caregiverUid, 'caregiver_user', 'caregiver_demo']));

      if (navigator.onLine) {
        // 1. Check caregiverLinks collection
        for (const uid of targetUids) {
          const linkRef = doc(db, 'caregiverLinks', `${uid}_${cleanId}`);
          const linkSnap = await getDoc(linkRef);
          if (linkSnap.exists()) return 'paired';
        }

        // 2. Check pairing_requests collection for accepted or pending status
        const qReqs = query(
          collection(db, 'pairing_requests'),
          where('patientId', '==', cleanId)
        );
        const snapReqs = await getDocs(qReqs);
        for (const d of snapReqs.docs) {
          const data = d.data();
          if (targetUids.includes(data.caregiverUid)) {
            if (data.status === 'accepted') return 'paired';
            if (data.status === 'pending') return 'pending';
          }
        }
      }

      // Check local storage fallback
      const localIds = this.getLocalPairedPatientIds();
      if (localIds.includes(cleanId)) return 'paired';

      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list = stored ? JSON.parse(stored) : [];
        const match = list.find((r: any) => r.patientId === cleanId && targetUids.includes(r.caregiverUid));
        if (match) return match.status === 'accepted' ? 'paired' : match.status === 'pending' ? 'pending' : 'none';
      } catch {}

      return 'none';
    } catch {
      return 'none';
    }
  },

  // Get paired patients list for a caregiver (async)
  async getCaregiverPatients(caregiverUid: string): Promise<PatientProfile[]> {
    if (!caregiverUid) return [];
    const idsSet = new Set<string>();
    const targetUids = Array.from(new Set([caregiverUid, 'caregiver_user', 'caregiver_demo']));

    if (navigator.onLine) {
      try {
        const q = query(
          collection(db, 'caregiverLinks'),
          where('caregiverUid', 'in', targetUids)
        );
        const snap = await getDocs(q);
        snap.forEach(d => {
          const pid = d.data().patientId;
          if (pid && !pid.startsWith('SS-IND-') && !pid.startsWith('MC-IND-')) {
            idsSet.add(pid.toUpperCase());
          }
        });

        // Also query accepted pairing requests
        const qReq = query(
          collection(db, 'pairing_requests'),
          where('status', '==', 'accepted')
        );
        const snapReq = await getDocs(qReq);
        snapReq.forEach(d => {
          const data = d.data();
          if (targetUids.includes(data.caregiverUid) && data.patientId && !data.patientId.startsWith('SS-IND-') && !data.patientId.startsWith('MC-IND-')) {
            idsSet.add(data.patientId.toUpperCase());
          }
        });
      } catch {}
    }

    const list: PatientProfile[] = [];
    for (const pid of Array.from(idsSet)) {
      const p = await this.searchPatientById(pid);
      if (p) list.push(p);
    }
    return list;
  },

  // Real-time listener for paired patients of a caregiver
  subscribeCaregiverPatients(_caregiverUid: string, callback: (patients: PatientProfile[]) => void): () => void {
    const isResidueId = (id: string): boolean => {
      if (!id) return true;
      const upper = id.trim().toUpperCase();
      return upper.startsWith('SS-IND-') || upper.startsWith('MC-IND-') || upper.startsWith('SS-') || upper === 'DEMO_PATIENT';
    };

    const loadAndEmit = async (patientIds: string[]) => {
      const set = new Set<string>();
      patientIds.forEach(id => {
        if (!isResidueId(id)) set.add(id);
      });

      // Default to real patient ASM58291 if no other valid links exist
      if (set.size === 0) {
        set.add('ASM58291');
      }

      const list: PatientProfile[] = [];
      for (const pid of Array.from(set)) {
        const p = await this.searchPatientById(pid);
        if (p) list.push(p);
      }
      callback(list);
    };

    if (!navigator.onLine) {
      const localIds = this.getLocalPairedPatientIds().filter(id => !isResidueId(id));
      loadAndEmit(localIds.length > 0 ? localIds : ['ASM58291']);
      return () => {};
    }

    // Subscribe to all caregiverLinks
    const qLinks = collection(db, 'caregiverLinks');

    // Subscribe to accepted pairing_requests
    const qReqs = query(
      collection(db, 'pairing_requests'),
      where('status', '==', 'accepted')
    );

    let linkIds: string[] = [];
    let reqIds: string[] = [];

    const sync = () => {
      const allIds = Array.from(new Set([...linkIds, ...reqIds]));
      loadAndEmit(allIds.length > 0 ? allIds : ['ASM58291']);
    };

    const unsubLinks = onSnapshot(qLinks, (snap) => {
      linkIds = [];
      snap.forEach(d => {
        const data = d.data();
        const pid = data.patientId || data.id;
        if (pid) {
          const upper = String(pid).toUpperCase();
          if (isResidueId(upper)) {
            // Delete legacy residue document from Firestore permanently!
            deleteDoc(doc(db, 'caregiverLinks', d.id)).catch(() => {});
          } else {
            linkIds.push(upper);
          }
        }
      });
      sync();
    }, () => sync());

    const unsubReqs = onSnapshot(qReqs, (snap) => {
      reqIds = [];
      snap.forEach(d => {
        const data = d.data();
        const pid = data.patientId;
        if (pid) {
          const upper = String(pid).toUpperCase();
          if (isResidueId(upper)) {
            // Delete legacy residue request from Firestore permanently!
            deleteDoc(doc(db, 'pairing_requests', d.id)).catch(() => {});
          } else {
            reqIds.push(upper);
          }
        }
      });
      sync();
    }, () => sync());

    return () => {
      unsubLinks();
      unsubReqs();
    };
  },

  // Real-time listener for patient's paired caregiver info
  subscribePairedCaregiver(patientId: string, callback: (info: { caregiverName: string; caregiverUid: string; caregiverEmail?: string; status: string } | null) => void): () => void {
    if (!patientId) {
      callback(null);
      return () => {};
    }

    const cleanId = patientId.trim().toUpperCase();

    if (!navigator.onLine) {
      callback(null);
      return () => {};
    }

    // 1. Primary check on caregiverLinks collection
    const qLink = query(collection(db, 'caregiverLinks'), where('patientId', '==', cleanId));
    const unsub = onSnapshot(qLink, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        callback({
          caregiverName: data.caregiverName || 'Primary Caregiver',
          caregiverUid: data.caregiverUid,
          caregiverEmail: data.caregiverEmail || 'caregiver@smritisetu.org',
          status: 'Active & Connected'
        });
      } else {
        // Fallback: check accepted pairing_requests
        const qReq = query(collection(db, 'pairing_requests'), where('patientId', '==', cleanId), where('status', '==', 'accepted'));
        getDocs(qReq).then(reqSnap => {
          if (!reqSnap.empty) {
            const data = reqSnap.docs[0].data();
            callback({
              caregiverName: data.caregiverName || 'Primary Caregiver',
              caregiverUid: data.caregiverUid,
              caregiverEmail: data.caregiverEmail || 'caregiver@smritisetu.org',
              status: 'Active & Connected'
            });
          } else {
            callback(null);
          }
        }).catch(() => callback(null));
      }
    }, () => callback(null));

    return unsub;
  },

  // Send real-time chat message (persist to Firestore + localStorage)
  async sendChatMessage(message: Omit<ChatMessage, 'id'>): Promise<void> {
    if (!message.patientId || !message.text.trim()) return;
    const cleanId = message.patientId.trim().toUpperCase();
    
    let threadId = message.threadId;
    if (!threadId) {
      if ((message.senderRole === 'doctor' && message.recipientRole === 'patient') || (message.senderRole === 'patient' && message.recipientRole === 'doctor')) {
        threadId = `${cleanId}_doctor`;
      } else if ((message.senderRole === 'doctor' && message.recipientRole === 'caregiver') || (message.senderRole === 'caregiver' && message.recipientRole === 'doctor')) {
        threadId = `${cleanId}_caregiver_doctor`;
      } else if (message.senderRole === 'doctor') {
        threadId = `${cleanId}_doctor`;
      } else {
        threadId = `${cleanId}_caregiver`;
      }
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: cleanId,
      senderUid: message.senderUid,
      senderName: message.senderName,
      senderRole: message.senderRole,
      recipientUid: message.recipientUid,
      recipientRole: message.recipientRole,
      threadId,
      text: message.text.trim(),
      timestamp: Date.now()
    };

    // 1. Write to local storage for instant offline availability
    try {
      const key = `smritisetu_chats_${cleanId}`;
      const saved = localStorage.getItem(key);
      const list: ChatMessage[] = saved ? JSON.parse(saved) : [];
      list.push(newMsg);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatMessagesUpdated', { detail: { patientId: cleanId, threadId } }));
    }

    // 2. Write to Firestore
    await addDoc(collection(db, 'chats'), newMsg).catch(() => {});
  },

  // Real-time listener for thread-specific chat messages
  subscribeChatMessages(
    patientId: string, 
    threadIdOrRole?: string | ((messages: ChatMessage[]) => void), 
    callbackArg?: (messages: ChatMessage[]) => void
  ) {
    if (!patientId) return () => {};
    const cleanId = patientId.trim().toUpperCase();

    let targetThread = typeof threadIdOrRole === 'string' ? threadIdOrRole : undefined;
    let callback = typeof threadIdOrRole === 'function' ? threadIdOrRole : callbackArg || (() => {});

    if (targetThread === 'doctor') targetThread = `${cleanId}_doctor`;
    if (targetThread === 'caregiver') targetThread = `${cleanId}_caregiver`;
    if (targetThread === 'caregiver_doctor') targetThread = `${cleanId}_caregiver_doctor`;

    const isMatch = (m: ChatMessage) => {
      if (!targetThread) return true;
      if (m.threadId) return m.threadId === targetThread;
      if (targetThread === `${cleanId}_doctor`) {
        return m.senderRole === 'doctor' || m.recipientRole === 'doctor';
      }
      if (targetThread === `${cleanId}_caregiver_doctor`) {
        return (m.senderRole === 'doctor' && m.recipientRole === 'caregiver') || (m.senderRole === 'caregiver' && m.recipientRole === 'doctor');
      }
      return m.senderRole !== 'doctor' && m.recipientRole !== 'doctor';
    };

    const getLocalChats = (): ChatMessage[] => {
      try {
        const saved = localStorage.getItem(`smritisetu_chats_${cleanId}`);
        const list: ChatMessage[] = saved ? JSON.parse(saved) : [];
        return list.filter(isMatch);
      } catch {
        return [];
      }
    };

    const handleUpdate = () => {
      const local = getLocalChats();
      local.sort((a, b) => a.timestamp - b.timestamp);
      callback(local);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('chatMessagesUpdated', handleUpdate);
    }

    const q = query(
      collection(db, 'chats'),
      where('patientId', '==', cleanId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const msg = { id: docSnap.id, ...docSnap.data() } as ChatMessage;
        if (isMatch(msg)) list.push(msg);
      });
      // Merge local messages if not yet in snapshot
      const local = getLocalChats();
      local.forEach(m => {
        if (!list.some(r => r.timestamp === m.timestamp && r.text === m.text)) {
          list.push(m);
        }
      });
      // Sort chronologically
      list.sort((a, b) => a.timestamp - b.timestamp);
      callback(list);
    }, () => {
      handleUpdate();
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('chatMessagesUpdated', handleUpdate);
      }
      unsub();
    };
  },

  // Get last chat message for a patient
  getLastChatMessage(patientId: string): ChatMessage | null {
    if (!patientId) return null;
    const cleanId = patientId.trim().toUpperCase();
    try {
      const saved = localStorage.getItem(`smritisetu_chats_${cleanId}`);
      if (saved) {
        const list: ChatMessage[] = JSON.parse(saved);
        if (list.length > 0) {
          list.sort((a, b) => a.timestamp - b.timestamp);
          return list[list.length - 1];
        }
      }
    } catch {}
    return null;
  },

  // Mark chat messages as read for a role
  markChatAsRead(patientId: string, userRole: string): void {
    if (!patientId || typeof window === 'undefined') return;
    const cleanId = patientId.trim().toUpperCase();
    localStorage.setItem(`smritisetu_chat_read_${cleanId}_${userRole}`, String(Date.now()));
  },

  // Check if unread messages exist for a role
  hasUnreadMessages(patientId: string, userRole: string): boolean {
    if (!patientId || typeof window === 'undefined') return false;
    const cleanId = patientId.trim().toUpperCase();
    const lastMsg = this.getLastChatMessage(cleanId);
    if (!lastMsg) return false;

    // Only count messages sent by the OPPOSITE role
    if (lastMsg.senderRole === userRole) return false;

    const lastReadStr = localStorage.getItem(`smritisetu_chat_read_${cleanId}_${userRole}`);
    const lastReadTs = lastReadStr ? parseInt(lastReadStr, 10) : 0;

    return lastMsg.timestamp > lastReadTs;
  },

  // Memory Lane Reminiscence Items
  getMemoryLaneItems(): MemoryItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('smritisetu_memory_lane');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallthrough
      }
    }
    return [];
  },

  saveMemoryLaneItems(items: MemoryItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smritisetu_memory_lane', JSON.stringify(items));
    }
  },

  addMemoryLaneItem(item: MemoryItem): MemoryItem[] {
    const current = this.getMemoryLaneItems();
    const updated = [item, ...current];
    this.saveMemoryLaneItems(updated);
    return updated;
  },

  deleteMemoryLaneItem(id: string): MemoryItem[] {
    const current = this.getMemoryLaneItems();
    const updated = current.filter((i) => i.id !== id);
    this.saveMemoryLaneItems(updated);
    return updated;
  },

  // Vocal Tone Monitoring Logs
  getVocalToneLogs(patientId?: string): VocalToneLog[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('smritisetu_vocal_tone_logs');
    if (saved) {
      try {
        const list: VocalToneLog[] = JSON.parse(saved);
        if (patientId) return list.filter(l => l.patientId === patientId);
        return list;
      } catch {
        return [];
      }
    }
    return [];
  },

  saveVocalToneLog(log: VocalToneLog): VocalToneLog[] {
    const current = this.getVocalToneLogs();
    const updated = [log, ...current.slice(0, 49)];
    if (typeof window !== 'undefined') {
      localStorage.setItem('smritisetu_vocal_tone_logs', JSON.stringify(updated));
    }
    return updated;
  },

  // Unpair caregiver and patient
  async unpairPatient(patientId: string, caregiverUid?: string): Promise<boolean> {
    try {
      const cleanId = patientId.trim().toUpperCase();
      const targetUids = Array.from(new Set([caregiverUid || '', 'caregiver_user', 'caregiver_demo'])).filter(Boolean);

      if (navigator.onLine) {
        // 1. Delete documents from caregiverLinks collection for all candidate UIDs
        for (const uid of targetUids) {
          await deleteDoc(doc(db, 'caregiverLinks', `${uid}_${cleanId}`)).catch(() => {});
        }

        // Delete any matching caregiverLinks doc for patientId
        try {
          const qLinks = query(collection(db, 'caregiverLinks'), where('patientId', '==', cleanId));
          const snapLinks = await getDocs(qLinks);
          for (const d of snapLinks.docs) {
            await deleteDoc(doc(db, 'caregiverLinks', d.id)).catch(() => {});
          }
        } catch {}

        // 2. Update pairing_requests to declined
        try {
          const qReqs = query(collection(db, 'pairing_requests'), where('patientId', '==', cleanId));
          const snapReqs = await getDocs(qReqs);
          for (const d of snapReqs.docs) {
            await updateDoc(doc(db, 'pairing_requests', d.id), { status: 'declined' }).catch(() => {});
          }
        } catch {}

        // 3. Reset caregiverId on patient profile in Firestore
        try {
          const patientRef = doc(db, 'patients', cleanId);
          await updateDoc(patientRef, { caregiverId: '' }).catch(() => {});
        } catch {}
      }

      // Remove from local storage cache
      try {
        const saved = localStorage.getItem('smritisetu_paired_patients');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          const updated = list.filter(id => id.trim().toUpperCase() !== cleanId);
          localStorage.setItem('smritisetu_paired_patients', JSON.stringify(updated));
        }
      } catch {}

      return true;
    } catch (err) {
      console.warn('Unpair patient error:', err);
      return false;
    }
  },

  // Send App Notification (Persistent Firestore & Offline LocalStorage)
  async sendNotification(notif: (Omit<AppNotification, 'id'> & { id?: string }) | AppNotification): Promise<void> {
    const notifId = notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AppNotification = {
      id: notifId,
      timestamp: notif.timestamp || Date.now(),
      read: notif.read || false,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      patientId: notif.patientId,
      caregiverUid: notif.caregiverUid,
      userId: notif.userId,
      doctorId: notif.doctorId,
      pairingRequestId: notif.pairingRequestId
    };

    offlineStorage.saveNotification(newNotif);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif, { merge: true });
      } catch (err) {
        console.warn('Write notification to Firestore error:', err);
      }
    }
  },

  // Real-time listener for notifications
  subscribeNotifications(_targetUid: string, _role: 'caregiver' | 'patient', callback: (notifications: AppNotification[]) => void): () => void {
    const getInitialNotifications = (): AppNotification[] => {
      const defaults: AppNotification[] = [
        {
          id: 'n1',
          title: 'Pairing Active',
          message: 'Caregiver connection with Mahesh (ASM58291) is active & live.',
          type: 'pairing_request',
          timestamp: Date.now() - 1000 * 60 * 15,
          read: false
        },
        {
          id: 'n2',
          title: 'Morning Medicine Taken',
          message: 'Donepezil 5mg marked complete by patient at 09:00 AM.',
          type: 'medication_alert',
          timestamp: Date.now() - 1000 * 60 * 120,
          read: true
        },
        {
          id: 'n3',
          title: 'Cognitive Test Passed',
          message: 'Mahesh scored 92% accuracy in Memory Match game test.',
          type: 'game_result',
          timestamp: Date.now() - 1000 * 60 * 300,
          read: true
        }
      ];
      try {
        const saved = localStorage.getItem('smritisetu_notifications');
        return saved ? JSON.parse(saved) : defaults;
      } catch {
        return defaults;
      }
    };

    if (!navigator.onLine) {
      callback(getInitialNotifications());
      return () => {};
    }

    const q = query(collection(db, 'notifications'));
    const unsub = onSnapshot(q, (snap) => {
      const list: AppNotification[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as AppNotification);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      
      if (list.length > 0) {
        callback(list);
      } else {
        callback(getInitialNotifications());
      }
    }, () => callback(getInitialNotifications()));

    return unsub;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (navigator.onLine) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch {}
    }
    try {
      const saved = localStorage.getItem('smritisetu_notifications');
      if (saved) {
        const list: AppNotification[] = JSON.parse(saved);
        const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem('smritisetu_notifications', JSON.stringify(updated));
      }
    } catch {}
  },

  async clearAllNotifications(): Promise<void> {
    try {
      localStorage.removeItem('smritisetu_notifications');
    } catch {}
  },

  // --- DOCTOR PORTAL INTEGRATION SERVICES ---

  // Save / Update Doctor Profile
  async saveDoctorProfile(profile: DoctorProfile): Promise<void> {
    offlineStorage.saveDoctorProfile(profile);
    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'doctors', profile.uid), profile, { merge: true });
      } catch (err) {
        console.warn('Firestore saveDoctorProfile failed:', err);
      }
    }
  },

  async getDoctorProfile(uid: string): Promise<DoctorProfile | null> {
    if (!uid) return null;
    const local = offlineStorage.getDoctorProfile(uid);
    if (local) return local;

    if (navigator.onLine) {
      try {
        const snap = await getDoc(doc(db, 'doctors', uid));
        if (snap.exists()) {
          const prof = snap.data() as DoctorProfile;
          offlineStorage.saveDoctorProfile(prof);
          return prof;
        }
      } catch (err) {
        console.warn('Firestore getDoctorProfile failed:', err);
      }
    }

    // Default primary doctor profile if none found
    if (uid === 'doc_rk_sharma' || uid === 'demo_doctor') {
      const defaultDoc: DoctorProfile = {
        uid,
        fullName: 'Dr. R. K. Sharma',
        registrationNumber: 'MCI-ASSAM-48291',
        specialization: 'Neurologist & Geriatric Specialist',
        qualification: 'MBBS, MD (Medicine), DM (Neurology)',
        experienceYears: 18,
        clinicHospital: 'Guwahati Medical College & Hospital',
        address: 'Bhangagarh, GMCH Road, Guwahati, Assam 781032',
        phone: '+91 98640 12345',
        email: 'dr.rksharma@gmch.gov.in',
        preferredLanguage: 'as',
        availability: 'Mon - Fri (10:00 AM - 04:00 PM)',
        bio: 'Senior Neurologist specializing in cognitive impairments, Alzheimer’s care, and neurological rehabilitation in Northeast India.',
        createdAt: Date.now() - 86400000 * 30
      };
      offlineStorage.saveDoctorProfile(defaultDoc);
      return defaultDoc;
    }

    return null;
  },

  // Doctor Patient Pairing Request Workflow
  async sendDoctorPairingRequest(doctorId: string, patientId: string): Promise<{ success: boolean; message: string }> {
    const cleanId = patientId.trim().toUpperCase();
    if (!cleanId) return { success: false, message: 'Please enter a valid Patient ID.' };

    const docProf = await this.getDoctorProfile(doctorId);
    const doctorName = docProf?.fullName || 'Dr. R. K. Sharma';
    const doctorHospital = docProf?.clinicHospital || 'Guwahati Medical College & Hospital';
    const doctorSpecialization = docProf?.specialization || 'Geriatric Specialist';

    // Verify patient exists
    const patientProf = await this.searchPatientById(cleanId);
    if (!patientProf) {
      return { success: false, message: `Patient ID "${cleanId}" not found in database.` };
    }

    // Check if already linked or request pending
    const existingReqs = offlineStorage.getDoctorPairingRequests(doctorId, cleanId);
    const pendingReq = existingReqs.find(r => r.patientId === cleanId && r.status === 'pending');
    if (pendingReq) {
      return { success: false, message: 'A pairing request is already pending for this patient.' };
    }

    const acceptedReq = existingReqs.find(r => r.patientId === cleanId && r.status === 'accepted');
    if (acceptedReq) {
      return { success: false, message: 'Doctor is already paired and linked with this patient.' };
    }

    const newReq: DoctorPairingRequest = {
      id: `doc_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      doctorId,
      doctorName,
      doctorHospital,
      doctorSpecialization,
      patientId: cleanId,
      patientName: patientProf.name,
      caregiverUid: patientProf.caregiverId,
      status: 'pending',
      createdAt: Date.now()
    };

    offlineStorage.saveDoctorPairingRequest(newReq);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'doctorPairingRequests', newReq.id), newReq);
      } catch (err) {
        console.warn('Firestore sendDoctorPairingRequest failed:', err);
      }
    }

    // Dispatch Notifications to Patient and Caregiver
    const caregiverTargetUid = patientProf?.caregiverUid || patientProf?.caregiverId || 'caregiver_user';
    await this.sendNotification({
      id: `notif_${Date.now()}_doc_req`,
      patientId: cleanId,
      caregiverUid: caregiverTargetUid,
      userId: cleanId,
      doctorId,
      pairingRequestId: newReq.id,
      title: 'Doctor Clinical Authorization Request',
      message: `Dr. ${doctorName} (${doctorHospital}) requested authorization to view cognitive chart and manage medical prescriptions. Request expires in 48 hours.`,
      type: 'doctor_pairing_request',
      timestamp: Date.now(),
      read: false
    });

    // Also dispatch copy to caregiver target UID explicitly
    if (caregiverTargetUid && caregiverTargetUid !== cleanId) {
      await this.sendNotification({
        id: `notif_${Date.now()}_cg_req`,
        patientId: cleanId,
        caregiverUid: caregiverTargetUid,
        userId: caregiverTargetUid,
        doctorId,
        pairingRequestId: newReq.id,
        title: 'Doctor Clinical Authorization Request',
        message: `Dr. ${doctorName} (${doctorHospital}) requested authorization for Patient ${patientProf?.name || cleanId}. Request expires in 48 hours.`,
        type: 'doctor_pairing_request',
        timestamp: Date.now(),
        read: false
      });
    }

    return { success: true, message: `Pairing request sent to Patient ${cleanId} and Caregiver!` };
  },

  subscribeDoctorPairingRequests(
    arg1?: any,
    arg2?: any,
    arg3?: any
  ): () => void {
    let filter: { doctorId?: string; patientId?: string } = {};
    let callback: (requests: DoctorPairingRequest[]) => void = () => {};

    if (typeof arg1 === 'object' && arg1 !== null) {
      filter = arg1;
      if (typeof arg2 === 'function') callback = arg2;
    } else if (typeof arg1 === 'string') {
      filter = { doctorId: arg1 };
      if (typeof arg2 === 'function') callback = arg2;
      else if (typeof arg3 === 'function') callback = arg3;
    } else {
      if (typeof arg2 === 'function') callback = arg2;
      else if (typeof arg3 === 'function') callback = arg3;
    }

    const cached = offlineStorage.getDoctorPairingRequests(filter.doctorId, filter.patientId);
    if (typeof callback === 'function') callback(cached);

    if (!navigator.onLine) return () => {};

    let q;
    if (filter.doctorId) {
      q = query(collection(db, 'doctorPairingRequests'), where('doctorId', '==', filter.doctorId));
    } else if (filter.patientId) {
      q = query(collection(db, 'doctorPairingRequests'), where('patientId', '==', filter.patientId.trim().toUpperCase()));
    } else {
      q = query(collection(db, 'doctorPairingRequests'));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list: DoctorPairingRequest[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as DoctorPairingRequest));
      list.sort((a, b) => b.createdAt - a.createdAt);
      offlineStorage.setDoctorPairingRequests(list);
      if (typeof callback === 'function') callback(list);
    }, () => {
      if (typeof callback === 'function') callback(cached);
    });

    return unsub;
  },

  async respondDoctorPairingRequest(requestId: string, action: 'accepted' | 'rejected', acceptedBy: 'patient' | 'caregiver'): Promise<void> {
    const allRequests = offlineStorage.getDoctorPairingRequests();
    let req = allRequests.find(r => r.id === requestId || r.patientId === requestId || r.id.includes(requestId));

    if (!req && navigator.onLine) {
      try {
        const snap = await getDoc(doc(db, 'doctorPairingRequests', requestId));
        if (snap.exists()) {
          req = snap.data() as DoctorPairingRequest;
        }
      } catch (err) {
        console.warn('Firestore fetch pairing request error:', err);
      }
    }

    if (!req) {
      req = {
        id: requestId.startsWith('doc_req_') ? requestId : `doc_req_${Date.now()}`,
        doctorId: 'doc_default',
        doctorName: 'Dr. R. K. Sharma',
        doctorHospital: 'Guwahati Medical College & Hospital',
        patientId: 'ASM58291',
        status: action,
        createdAt: Date.now()
      };
    }

    const updatedReq: DoctorPairingRequest = {
      ...req,
      status: action,
      respondedAt: Date.now(),
      acceptedBy: action === 'accepted' ? acceptedBy : undefined
    };

    offlineStorage.saveDoctorPairingRequest(updatedReq);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'doctorPairingRequests', updatedReq.id), updatedReq, { merge: true });
      } catch (err) {
        console.warn('Firestore respondDoctorPairingRequest failed:', err);
      }
    }

    if (action === 'accepted') {
      const docId = updatedReq.doctorId || 'doc_default';
      const docName = updatedReq.doctorName || 'Dr. R. K. Sharma';
      const docHosp = updatedReq.doctorHospital || 'Guwahati Medical College & Hospital';

      // Update patient profile with linked doctor details (3-way linkage: Doctor <-> Patient <-> Caregiver)
      await this.updatePatientMedicalInfo(updatedReq.patientId, {
        doctorId: docId,
        doctorName: docName,
        doctorHospital: docHosp,
        isDoctorLinked: true
      });

      // Also ensure local profile cache is updated
      const p = await this.searchPatientById(updatedReq.patientId);
      if (p) {
        p.doctorId = docId;
        p.doctorName = docName;
        p.doctorHospital = docHosp;
        p.isDoctorLinked = true;
        offlineStorage.savePatientProfile(p);
      }

      // Send confirmation notification to doctor
      await this.sendNotification({
        id: `notif_${Date.now()}_doc_accepted`,
        doctorId: docId,
        patientId: updatedReq.patientId,
        title: 'Authorization Accepted',
        message: `Patient ${updatedReq.patientName || updatedReq.patientId} authorized clinical pairing via ${acceptedBy}. Full medical chart access granted.`,
        type: 'doctor_pairing_request',
        timestamp: Date.now(),
        read: false
      });
    }

    window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: updatedReq.patientId }));
  },

  // Get Linked Patients for Doctor
  async getLinkedPatientsForDoctor(doctorId: string): Promise<PatientProfile[]> {
    if (!doctorId) return [];
    
    // 1. Gather requests from local offline storage
    const requests = offlineStorage.getDoctorPairingRequests();
    let acceptedPatientIds = requests
      .filter(r => r.status === 'accepted' && (r.doctorId === doctorId || doctorId === 'doc_default' || r.doctorId === 'doc_default'))
      .map(r => r.patientId);

    // 2. Gather online Firestore requests & patient profiles with matching doctorId
    if (navigator.onLine) {
      try {
        const snapReqs = await getDocs(query(collection(db, 'doctorPairingRequests'), where('status', '==', 'accepted')));
        snapReqs.forEach(d => {
          const req = d.data() as DoctorPairingRequest;
          if (req.doctorId === doctorId || doctorId === 'doc_default' || req.doctorId === 'doc_default') {
            acceptedPatientIds.push(req.patientId);
          }
        });

        const snapPats = await getDocs(query(collection(db, 'patients'), where('doctorId', '==', doctorId)));
        snapPats.forEach(d => {
          const prof = d.data() as PatientProfile;
          if (prof.patientId) acceptedPatientIds.push(prof.patientId);
        });
      } catch (err) {
        console.warn('Firestore getLinkedPatientsForDoctor query error:', err);
      }
    }

    // Default demo/sample patient ASM58291 always available
    acceptedPatientIds.push('ASM58291');

    const uniqueIds = Array.from(new Set(acceptedPatientIds.map(id => id.trim().toUpperCase())));

    const patients: PatientProfile[] = [];
    for (const pId of uniqueIds) {
      const prof = await this.searchPatientById(pId);
      if (prof) {
        prof.doctorId = doctorId;
        prof.doctorName = prof.doctorName || 'Dr. R. K. Sharma';
        prof.doctorHospital = prof.doctorHospital || 'Guwahati Medical College & Hospital';
        prof.isDoctorLinked = true;
        patients.push(prof);
      }
    }

    return patients;
  },

  // Appointments Service
  async createAppointment(appData: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const newApp: Appointment = {
      ...appData,
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };

    offlineStorage.saveAppointment(newApp);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appointmentsUpdated', { detail: newApp.patientId }));
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: newApp.patientId }));
    }

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'appointments', newApp.id), newApp);
      } catch (err) {
        console.warn('Firestore createAppointment failed:', err);
      }
    }

    // Send notifications to Patient & Caregiver
    await this.sendNotification({
      id: `notif_app_${Date.now()}`,
      patientId: newApp.patientId,
      caregiverUid: newApp.caregiverUid,
      appointmentId: newApp.id,
      title: 'New Clinical Appointment Scheduled',
      message: `${newApp.doctorName} scheduled a ${newApp.type} on ${newApp.date} at ${newApp.time}.`,
      type: 'appointment',
      timestamp: Date.now(),
      read: false
    });

    return newApp;
  },

  subscribeAppointments(
    arg1?: any,
    arg2?: any,
    arg3?: any
  ): () => void {
    let filter: { doctorId?: string; patientId?: string } = {};
    let callback: (appointments: Appointment[]) => void = () => {};

    if (typeof arg1 === 'object' && arg1 !== null) {
      filter = arg1;
      if (typeof arg2 === 'function') callback = arg2;
    } else if (typeof arg1 === 'string') {
      filter.doctorId = arg1;
      if (typeof arg2 === 'string') filter.patientId = arg2;
      if (typeof arg2 === 'function') callback = arg2;
      if (typeof arg3 === 'function') callback = arg3;
    } else {
      if (typeof arg2 === 'function') callback = arg2;
      else if (typeof arg3 === 'function') callback = arg3;
    }

    const cached = offlineStorage.getAppointments(filter.doctorId, filter.patientId);
    if (typeof callback === 'function') callback(cached);

    if (!navigator.onLine) return () => {};

    let q;
    if (filter.doctorId && filter.patientId) {
      q = query(collection(db, 'appointments'), where('doctorId', '==', filter.doctorId), where('patientId', '==', filter.patientId.trim().toUpperCase()));
    } else if (filter.doctorId) {
      q = query(collection(db, 'appointments'), where('doctorId', '==', filter.doctorId));
    } else if (filter.patientId) {
      q = query(collection(db, 'appointments'), where('patientId', '==', filter.patientId.trim().toUpperCase()));
    } else {
      q = query(collection(db, 'appointments'));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list: Appointment[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as Appointment));
      list.sort((a, b) => b.createdAt - a.createdAt);
      offlineStorage.setAppointments(list);
      if (typeof callback === 'function') callback(list);
    }, () => {
      if (typeof callback === 'function') callback(cached);
    });

    return unsub;
  },

  // Clinical Notes Service (With Visibility Toggles)
  async createClinicalNote(noteData: Omit<ClinicalNote, 'id' | 'createdAt'>): Promise<ClinicalNote> {
    return this.addClinicalNote(noteData);
  },

  async addClinicalNote(noteData: Omit<ClinicalNote, 'id' | 'createdAt'>): Promise<ClinicalNote> {
    const newNote: ClinicalNote = {
      ...noteData,
      id: `clin_note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };

    offlineStorage.saveClinicalNote(newNote);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clinicalNotesUpdated', { detail: newNote.patientId }));
      window.dispatchEvent(new CustomEvent('patientProfileUpdated', { detail: newNote.patientId }));
    }

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'clinicalNotes', newNote.id), newNote);
      } catch (err) {
        console.warn('Firestore addClinicalNote failed:', err);
      }
    }

    // Mirror to patientNotes if visible to Patient or Caregiver
    if (newNote.isVisibleToPatient || newNote.isVisibleToCaregiver) {
      await this.addNote(newNote.patientId, {
        title: newNote.title,
        body: newNote.content,
        writtenBy: newNote.doctorName,
        role: 'doctor'
      });
    }

    return newNote;
  },

  subscribeClinicalNotes(
    arg1?: any,
    arg2?: any,
    arg3?: any
  ): () => void {
    let filter: { doctorId?: string; patientId?: string; forRole?: 'doctor' | 'patient' | 'caregiver' } = {};
    let callback: (notes: ClinicalNote[]) => void = () => {};

    if (typeof arg1 === 'object' && arg1 !== null) {
      filter = arg1;
      if (typeof arg2 === 'function') callback = arg2;
    } else if (typeof arg1 === 'string') {
      filter.doctorId = arg1;
      if (typeof arg2 === 'string') filter.patientId = arg2;
      if (typeof arg2 === 'function') callback = arg2;
      if (typeof arg3 === 'function') callback = arg3;
    } else {
      if (typeof arg2 === 'function') callback = arg2;
      else if (typeof arg3 === 'function') callback = arg3;
    }

    const cached = offlineStorage.getClinicalNotes(filter.doctorId, filter.patientId);
    const filteredCached = cached.filter(n => {
      if (filter.forRole === 'patient') return n.isVisibleToPatient;
      if (filter.forRole === 'caregiver') return n.isVisibleToCaregiver;
      return true;
    });

    if (typeof callback === 'function') callback(filteredCached);

    if (!navigator.onLine) return () => {};

    let q;
    if (filter.doctorId && filter.patientId) {
      q = query(collection(db, 'clinicalNotes'), where('doctorId', '==', filter.doctorId), where('patientId', '==', filter.patientId));
    } else if (filter.doctorId) {
      q = query(collection(db, 'clinicalNotes'), where('doctorId', '==', filter.doctorId));
    } else if (filter.patientId) {
      q = query(collection(db, 'clinicalNotes'), where('patientId', '==', filter.patientId));
    } else {
      q = query(collection(db, 'clinicalNotes'));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list: ClinicalNote[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as ClinicalNote));
      list.sort((a, b) => b.createdAt - a.createdAt);
      offlineStorage.setClinicalNotes(list);
      
      const filtered = list.filter(n => {
        if (filter.forRole === 'patient') return n.isVisibleToPatient;
        if (filter.forRole === 'caregiver') return n.isVisibleToCaregiver;
        return true;
      });

      if (typeof callback === 'function') callback(filtered);
    }, () => {
      if (typeof callback === 'function') callback(filteredCached);
    });

    return unsub;
  },

  // Doctor Tasks Service
  async addDoctorTask(taskData: Omit<DoctorTask, 'id' | 'createdAt'>): Promise<DoctorTask> {
    const newTask: DoctorTask = {
      ...taskData,
      id: `doc_task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };

    offlineStorage.saveDoctorTask(newTask);

    if (navigator.onLine) {
      try {
        await setDoc(doc(db, 'doctorTasks', newTask.id), newTask);
      } catch (err) {
        console.warn('Firestore addDoctorTask failed:', err);
      }
    }

    // Auto-create corresponding medication/routine reminder for patient
    await this.addMedication(newTask.patientId, {
      name: newTask.title,
      time: newTask.time,
      repeatPattern: newTask.repeatSchedule,
      scheduledBy: newTask.doctorName || 'Attending Doctor'
    });

    return newTask;
  },

  subscribeDoctorTasks(
    arg1?: any,
    arg2?: any,
    arg3?: any
  ): () => void {
    let patientId = '';
    let callback: (tasks: DoctorTask[]) => void = () => {};

    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      patientId = arg2;
      if (typeof arg3 === 'function') callback = arg3;
    } else if (typeof arg1 === 'string' && typeof arg2 === 'function') {
      patientId = arg1;
      callback = arg2;
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      patientId = arg1.patientId || '';
      if (typeof arg2 === 'function') callback = arg2;
    }

    const cached = offlineStorage.getDoctorTasks(patientId);
    if (typeof callback === 'function') callback(cached);

    if (!navigator.onLine || !patientId) return () => {};

    const q = query(collection(db, 'doctorTasks'), where('patientId', '==', patientId.trim().toUpperCase()));
    const unsub = onSnapshot(q, (snap) => {
      const list: DoctorTask[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as DoctorTask));
      list.sort((a, b) => b.createdAt - a.createdAt);
      offlineStorage.setDoctorTasks(list);
      if (typeof callback === 'function') callback(list);
    }, () => {
      if (typeof callback === 'function') callback(cached);
    });

    return unsub;
  },

  async logActivity(patientId: string, activityData: any): Promise<void> {
    await this.sendNotification({
      patientId,
      title: 'Activity Logged',
      message: `Caregiver logged activity: ${activityData.activityType || activityData.type || 'Daily Routine'}.`,
      type: 'pairing_request',
      timestamp: Date.now(),
      read: false
    });
  },

  async getPrescriptions(patientId: string): Promise<Prescription[]> {
    if (!patientId) return [];
    return offlineStorage.getPrescriptions(patientId);
  },

  async getGameResults(patientId: string): Promise<GameResult[]> {
    if (!patientId) return [];
    return offlineStorage.getGameResults(patientId);
  },

  subscribeUserNotifications(filterId: string, callback: (notifs: AppNotification[]) => void): () => void {
    if (!filterId) {
      callback([]);
      return () => {};
    }

    const cached = offlineStorage.getNotifications(filterId);
    callback(cached);

    if (!navigator.onLine) return () => {};

    const q = query(collection(db, 'notifications'));
    const unsub = onSnapshot(q, (snap) => {
      const list: AppNotification[] = [];
      snap.forEach(d => {
        const item = { ...d.data(), id: d.id } as AppNotification;
        if (item.userId === filterId || item.patientId === filterId || item.caregiverUid === filterId || item.doctorId === filterId) {
          list.push(item);
        }
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      callback(list);
    }, () => callback(cached));

    return unsub;
  }
};

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  dateTag: string;
  category: 'family' | 'festival' | 'travel' | 'childhood';
  audioStory?: string;
  quizPrompt?: string;
  quizOptions?: string[];
  correctOptionIndex?: number;
}

export interface VocalToneLog {
  id: string;
  patientId: string;
  timestamp: string;
  calmScore: number;
  stressScore: number;
  confidenceScore: number;
  pitchHz: number;
  decibels: number;
  caregiverAlert: boolean;
}
