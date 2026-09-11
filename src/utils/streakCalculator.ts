import type { GameResult, PatientReminder } from '../types';

/**
 * Calculates the exact number of consecutive days with activity
 * (game played or reminder completed), ending on today or yesterday.
 */
export const calculateStreakDays = (gameResults: GameResult[], reminders: PatientReminder[]): number => {
  const activeDates = new Set<string>();

  // Helper to format date object into YYYY-MM-DD in local time
  const toLocalDateString = (ts: number): string => {
    const d = new Date(ts);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  gameResults.forEach(g => {
    if (g.timestamp) {
      activeDates.add(toLocalDateString(g.timestamp));
    }
  });

  reminders.forEach(r => {
    if (r.completed && r.completedAt) {
      activeDates.add(toLocalDateString(r.completedAt));
    }
  });

  if (activeDates.size === 0) return 0;

  const now = new Date();
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

  // If today has no activity yet, check if yesterday was active
  if (!activeDates.has(checkStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (!activeDates.has(checkStr)) {
      return 0; // Streak broken
    }
  }

  // Count consecutive active days backwards
  let streak = 0;
  while (activeDates.has(checkStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  }

  return streak;
};
