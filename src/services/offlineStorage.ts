import type { GameResult, PatientReminder, PatientProfile, AdaptiveEvaluation, CustomMemoryQuestion } from '../types';

const STORAGE_KEYS = {
  GAME_RESULTS: 'smritisetu_game_results',
  REMINDERS: 'smritisetu_reminders',
  PATIENT_PROFILES: 'smritisetu_patient_profiles',
  DIFFICULTY_LEVELS: 'smritisetu_difficulty_levels',
  EVALUATIONS: 'smritisetu_evaluations',
  CUSTOM_QUESTIONS: 'smritisetu_custom_questions'
};

const DEFAULT_DIFFICULTIES = {
  memory: 2,
  attention: 2,
  pattern: 2,
  routine: 2
};

export const offlineStorage = {
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
