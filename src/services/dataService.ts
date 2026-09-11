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
import { db } from './firebase';
import { offlineStorage } from './offlineStorage';
import type { GameResult, PatientReminder, PatientProfile, AdaptiveEvaluation, PairingRequest, ChatMessage } from '../types';

export const dataService = {
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

  // Search real Firestore Patient by Patient ID Code
  async searchPatientById(patientId: string): Promise<PatientProfile | null> {
    if (!patientId || !patientId.trim()) return null;
    const cleanId = patientId.trim().toUpperCase();

    // Check local storage first
    const cachedProf = offlineStorage.getPatientProfile(cleanId);
    if (cachedProf) return cachedProf;

    if (!navigator.onLine) return null;

    try {
      // 1. Direct doc lookup by patientId key
      const snap = await getDoc(doc(db, 'patients', cleanId));
      if (snap.exists()) {
        const prof = snap.data() as PatientProfile;
        offlineStorage.savePatientProfile(prof);
        return prof;
      }

      // 2. Query patients collection by patientId field
      const qPatients = query(collection(db, 'patients'), where('patientId', '==', cleanId));
      const querySnapPatients = await getDocs(qPatients);
      if (!querySnapPatients.empty) {
        const prof = querySnapPatients.docs[0].data() as PatientProfile;
        offlineStorage.savePatientProfile(prof);
        return prof;
      }

      // 3. Query users collection as fallback
      const qUsers = query(collection(db, 'users'), where('patientId', '==', cleanId));
      const querySnapUsers = await getDocs(qUsers);
      if (!querySnapUsers.empty) {
        const uData = querySnapUsers.docs[0].data();
        const prof: PatientProfile = {
          id: uData.uid,
          patientId: uData.patientId || cleanId,
          name: uData.displayName || uData.name || 'Patient',
          email: uData.email,
          phone: uData.phone,
          age: uData.age || 70,
          gender: uData.gender || 'Male',
          state: uData.state || 'Assam',
          preferredLanguage: uData.preferredLanguage || 'en',
          createdAt: uData.createdAt || Date.now()
        };
        offlineStorage.savePatientProfile(prof);
        return prof;
      }

      // 4. Mahesh default patient record for ASM58291
      if (cleanId === 'ASM58291') {
        const maheshProf: PatientProfile = {
          id: 'ASM58291',
          patientId: 'ASM58291',
          name: 'Mahesh',
          age: 70,
          gender: 'Male',
          state: 'Assam',
          preferredLanguage: 'as',
          createdAt: Date.now()
        };
        offlineStorage.savePatientProfile(maheshProf);
        return maheshProf;
      }

      return null;
    } catch (err) {
      console.warn('Patient ID search error:', err);
      return null;
    }
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
            // Filter out legacy hardcoded format strings
            if (!upper.startsWith('SS-IND-') && !upper.startsWith('MC-IND-')) {
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
    if (!current.includes(cleanId)) {
      const updated = [cleanId, ...current];
      localStorage.setItem('smritisetu_paired_patients', JSON.stringify(updated));
    }
  },

  // Caregiver links patient by Patient ID
  async linkCaregiverToPatient(caregiverUid: string, patientId: string): Promise<boolean> {
    try {
      const cleanId = patientId.trim().toUpperCase();
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

    // 1. Ensure profile exists for this patient ID
    const existing = offlineStorage.getPatientProfile(cleanId);
    if (!existing) {
      const stateMap: Record<string, any> = {
        'ASM': 'Assam',
        'ML': 'Meghalaya',
        'TR': 'Tripura',
        'MN': 'Manipur',
        'NL': 'Nagaland',
        'MZ': 'Mizoram',
        'AR': 'Arunachal Pradesh',
        'SK': 'Sikkim'
      };
      const prefix = cleanId.slice(0, 3).toUpperCase();
      const state = stateMap[prefix] || stateMap[cleanId.slice(0, 2).toUpperCase()] || 'Assam';

      const prof: PatientProfile = {
        id: cleanId,
        patientId: cleanId,
        name: cleanId === 'ASM58291' ? 'Mahesh' : 'Patient',
        age: 72,
        gender: 'Male',
        state,
        preferredLanguage: 'en',
        createdAt: Date.now()
      };
      offlineStorage.savePatientProfile(prof);
    }

    // 2. Write pairing request doc in Firestore as 'pending' (Awaiting Patient Acceptance)
    const reqData = {
      id: `req_${Date.now()}`,
      patientId: cleanId,
      caregiverUid,
      caregiverName: caregiverName || 'Caregiver',
      caregiverEmail: caregiverEmail || '',
      status: 'pending',
      timestamp: Date.now()
    };

    await addDoc(collection(db, 'pairing_requests'), reqData).catch(() => {});

    // Save pending request to local storage so it persists across reloads offline
    try {
      const stored = localStorage.getItem('smritisetu_pending_requests');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.some((r: any) => r.patientId === cleanId && r.caregiverUid === caregiverUid && r.status === 'pending')) {
        list.push(reqData);
        localStorage.setItem('smritisetu_pending_requests', JSON.stringify(list));
      }
    } catch {}
  },

  // Real-time listener for pending pairing requests for a patient
  subscribePairingRequests(patientId: string, callback: (requests: PairingRequest[]) => void) {
    if (!patientId) return () => {};
    const cleanId = patientId.trim().toUpperCase();

    const getLocalPending = (): PairingRequest[] => {
      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list: PairingRequest[] = stored ? JSON.parse(stored) : [];
        return list.filter(r => r.patientId === cleanId && r.status === 'pending');
      } catch {
        return [];
      }
    };

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
      // Merge local pending requests if missing
      const local = getLocalPending();
      local.forEach(l => {
        if (!list.some(r => r.caregiverUid === l.caregiverUid)) {
          list.push(l);
        }
      });
      callback(list);
    }, () => callback(getLocalPending()));
    return unsub;
  },

  // Respond to pairing request (accept / decline)
  async respondToPairingRequest(requestId: string, status: 'accepted' | 'declined', patientId: string, caregiverUid: string, caregiverName?: string): Promise<void> {
    try {
      if (requestId && !requestId.startsWith('req_')) {
        const reqRef = doc(db, 'pairing_requests', requestId);
        await updateDoc(reqRef, { status }).catch(() => {});
      }

      // Remove / update local pending status
      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list = stored ? JSON.parse(stored) : [];
        const updated = list.map((r: any) => (r.id === requestId || (r.patientId === patientId && r.caregiverUid === caregiverUid)) ? { ...r, status } : r);
        localStorage.setItem('smritisetu_pending_requests', JSON.stringify(updated.filter((r: any) => r.status === 'pending')));
      } catch {}

      if (status === 'accepted') {
        const linkRef = doc(db, 'caregiverLinks', `${caregiverUid}_${patientId}`);
        await setDoc(linkRef, {
          caregiverUid,
          caregiverName: caregiverName || 'Caregiver',
          patientId,
          linkedAt: Date.now()
        }).catch(() => {});

        // Also update patient profile doc
        const patientRef = doc(db, 'patients', patientId);
        await updateDoc(patientRef, {
          caregiverId: caregiverUid
        }).catch(() => {});

        this.addLocalPairedPatient(patientId);
      }
    } catch (err) {
      console.warn('Respond to pairing request error:', err);
    }
  },

  // Check if Caregiver and Patient are paired
  async checkPairingStatus(caregiverUid: string, patientId: string): Promise<'paired' | 'pending' | 'none'> {
    try {
      const cleanId = patientId.trim().toUpperCase();
      const localIds = this.getLocalPairedPatientIds();
      if (localIds.includes(cleanId)) return 'paired';

      const linkRef = doc(db, 'caregiverLinks', `${caregiverUid}_${cleanId}`);
      const linkSnap = await getDoc(linkRef);
      if (linkSnap.exists()) return 'paired';

      // Check local pending requests
      try {
        const stored = localStorage.getItem('smritisetu_pending_requests');
        const list = stored ? JSON.parse(stored) : [];
        const match = list.find((r: any) => r.patientId === cleanId && r.caregiverUid === caregiverUid);
        if (match) return match.status === 'accepted' ? 'paired' : match.status === 'pending' ? 'pending' : 'none';
      } catch {}

      const q = query(
        collection(db, 'pairing_requests'),
        where('patientId', '==', cleanId),
        where('caregiverUid', '==', caregiverUid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const reqData = snap.docs[0].data();
        return reqData.status === 'accepted' ? 'paired' : reqData.status === 'pending' ? 'pending' : 'none';
      }

      return 'none';
    } catch {
      return 'none';
    }
  },

  // Get paired patients list for a caregiver (async)
  async getCaregiverPatients(caregiverUid: string): Promise<PatientProfile[]> {
    const idsSet = new Set<string>(this.getLocalPairedPatientIds());

    try {
      const q = query(
        collection(db, 'pairing_requests'),
        where('caregiverUid', '==', caregiverUid),
        where('status', '==', 'accepted')
      );
      const snap = await getDocs(q);
      snap.forEach(d => {
        const pid = d.data().patientId;
        if (pid) idsSet.add(pid);
      });
    } catch {}

    const list: PatientProfile[] = [];
    for (const pid of Array.from(idsSet)) {
      const p = await this.searchPatientById(pid);
      if (p) list.push(p);
    }
    return list;
  },

  // Real-time listener for paired patients of a caregiver (only accepted requests)
  subscribeCaregiverPatients(caregiverUid: string, callback: (patients: PatientProfile[]) => void): () => void {
    if (!caregiverUid) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'pairing_requests'),
      where('caregiverUid', '==', caregiverUid),
      where('status', '==', 'accepted')
    );

    const loadAndEmit = async (snapPatientIds: string[]) => {
      const idsSet = new Set<string>([...this.getLocalPairedPatientIds(), ...snapPatientIds]);
      const list: PatientProfile[] = [];
      for (const pid of Array.from(idsSet)) {
        const p = await this.searchPatientById(pid);
        if (p) list.push(p);
      }
      callback(list);
    };

    const unsub = onSnapshot(q, async (snap) => {
      const patientIds: string[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.patientId && data.status === 'accepted') patientIds.push(data.patientId);
      });
      await loadAndEmit(patientIds);
    }, async () => {
      await loadAndEmit([]);
    });

    return unsub;
  },

  // Real-time listener for patient's paired caregiver info
  subscribePairedCaregiver(patientId: string, callback: (info: { caregiverName: string; caregiverUid: string; caregiverEmail?: string; status: string } | null) => void): () => void {
    if (!patientId) {
      callback(null);
      return () => {};
    }

    const q = query(collection(db, 'pairing_requests'), where('patientId', '==', patientId), where('status', '==', 'accepted'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        callback(null);
        return;
      }
      const data = snap.docs[0].data();
      callback({
        caregiverName: data.caregiverName || 'Primary Caregiver',
        caregiverUid: data.caregiverUid,
        caregiverEmail: data.caregiverEmail || 'caregiver@smritisetu.org',
        status: 'Active & Connected'
      });
    }, () => callback(null));

    return unsub;
  },

  // Send real-time chat message (persist to Firestore + localStorage)
  async sendChatMessage(message: Omit<ChatMessage, 'id'>): Promise<void> {
    if (!message.patientId || !message.text.trim()) return;
    const cleanId = message.patientId.trim().toUpperCase();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientId: cleanId,
      senderUid: message.senderUid,
      senderName: message.senderName,
      senderRole: message.senderRole,
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

    // 2. Write to Firestore
    await addDoc(collection(db, 'chats'), {
      patientId: cleanId,
      senderUid: message.senderUid,
      senderName: message.senderName,
      senderRole: message.senderRole,
      text: message.text.trim(),
      timestamp: newMsg.timestamp
    }).catch(() => {});
  },

  // Real-time listener for chat messages
  subscribeChatMessages(patientId: string, callback: (messages: ChatMessage[]) => void) {
    if (!patientId) return () => {};
    const cleanId = patientId.trim().toUpperCase();

    const getLocalChats = (): ChatMessage[] => {
      try {
        const saved = localStorage.getItem(`smritisetu_chats_${cleanId}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    };

    const q = query(
      collection(db, 'chats'),
      where('patientId', '==', cleanId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
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
      const local = getLocalChats();
      local.sort((a, b) => a.timestamp - b.timestamp);
      callback(local);
    });
    return unsub;
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
