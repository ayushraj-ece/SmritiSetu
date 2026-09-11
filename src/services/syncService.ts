import { db } from './firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { offlineStorage } from './offlineStorage';

export const syncService = {
  async syncPendingData(): Promise<{ syncedCount: number; errors: number }> {
    if (!navigator.onLine) {
      return { syncedCount: 0, errors: 0 };
    }

    let syncedCount = 0;
    let errors = 0;

    // Sync game results
    const results = offlineStorage.getGameResults();
    const unsyncedResults = results.filter(r => !r.synced);
    const syncedIds: string[] = [];

    for (const result of unsyncedResults) {
      try {
        const gameRef = collection(db, 'gameResults');
        const docRef = await addDoc(gameRef, {
          patientId: result.patientId,
          gameCategory: result.gameCategory,
          difficultyLevel: result.difficultyLevel,
          score: result.score,
          accuracyPercentage: result.accuracyPercentage,
          responseTimeSeconds: result.responseTimeSeconds,
          timestamp: result.timestamp || Date.now()
        });

        if (docRef.id) {
          syncedCount++;
          if (result.id) syncedIds.push(result.id);
        }
      } catch (err) {
        console.warn('Sync failed for result doc:', err);
        errors++;
      }
    }

    if (syncedIds.length > 0) {
      offlineStorage.markResultsSynced(syncedIds);
    }

    // Sync reminders
    const reminders = offlineStorage.getReminders();
    for (const reminder of reminders) {
      if (reminder.synced === false && reminder.id) {
        try {
          const remRef = doc(db, 'reminders', reminder.id);
          await updateDoc(remRef, {
            completed: reminder.completed,
            completedAt: reminder.completedAt || Date.now()
          });
          syncedCount++;
        } catch {
          // If firestore document creation needed
          errors++;
        }
      }
    }

    return { syncedCount, errors };
  }
};
