import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Gets the total water intake for a specific date
 */
export const getDailyTotal = async (db: SQLiteDatabase, date: Date): Promise<number> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_log WHERE drank_at >= ? AND drank_at <= ?',
      [startOfDay.getTime(), endOfDay.getTime()]
    );

    return result?.total || 0;
  } catch (error) {
    console.error('Error getting daily total:', error);
    return 0;
  }
};

/**
 * Gets the daily goal that was active on a specific date
 */
export const getDailyGoalForDate = async (db: SQLiteDatabase, date: Date): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ goal_ml: number }>(
      'SELECT goal_ml FROM goal_history WHERE changed_at <= ? ORDER BY changed_at DESC LIMIT 1',
      [date.getTime()]
    );
    return result?.goal_ml || 2000;
  } catch (error) {
    console.error('Error getting goal for date:', error);
    return 2000;
  }
};

/**
 * Calculates the current streak of consecutive days where the goal was met
 * If today's goal isn't met yet, it starts checking from yesterday
 */
export const calculateCurrentStreak = async (db: SQLiteDatabase): Promise<number> => {
  try {
    let streak = 0;
    const today = new Date();
    let startFromYesterday = false;

    // First check if today's goal is met
    const todayTotal = await getDailyTotal(db, today);
    const todayGoal = await getDailyGoalForDate(db, today);

    if (todayTotal >= todayGoal) {
      // Today is complete, include it in the streak
      streak++;
    } else {
      // Today is not complete yet, start checking from yesterday
      startFromYesterday = true;
    }

    // Check backwards from yesterday (or the day after today if today is complete)
    const startDay = startFromYesterday ? 1 : 1;
    for (let i = startDay; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const dailyTotal = await getDailyTotal(db, checkDate);
      const goalForDate = await getDailyGoalForDate(db, checkDate);

      if (dailyTotal >= goalForDate) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating current streak:', error);
    return 0;
  }
};
