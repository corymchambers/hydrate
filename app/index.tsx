import WaterDrop from '@/components/WaterDrop';
import WaterGoalAnimation from '@/components/WaterGoalAnimation';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [goalAmount, setGoalAmount] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);

  // Get current date formatted as "Monday, January 1"
  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    return today.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadDailyGoal(),
      loadTodayWaterIntake(),
      loadCurrentStreak()
    ]);
  };

  const loadDailyGoal = async () => {
    try {
      const result = await db.getFirstAsync<{ goal_ml: number }>(
        'SELECT goal_ml FROM goal_history ORDER BY changed_at DESC LIMIT 1'
      );
      if (result) {
        setGoalAmount(result.goal_ml);
      }
    } catch (error) {
      console.error('Error loading daily goal:', error);
    }
  };

  const loadTodayWaterIntake = async () => {
    try {
      // Get start of today in milliseconds
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.getTime();

      // Get end of today in milliseconds
      const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1;

      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_log WHERE drank_at >= ? AND drank_at <= ?',
        [startOfDay, endOfDay]
      );

      if (result) {
        setCurrentAmount(result.total);
      }
    } catch (error) {
      console.error('Error loading today\'s water intake:', error);
    }
  };

  const getDailyGoalForDate = async (date: Date): Promise<number> => {
    try {
      // Get the goal that was active on this date
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

  const getDailyTotal = async (date: Date): Promise<number> => {
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

  const loadCurrentStreak = async () => {
    try {
      let streak = 0;
      const today = new Date();

      // Check backwards from today until we find a day that didn't meet the goal
      for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);

        const dailyTotal = await getDailyTotal(checkDate);
        const goalForDate = await getDailyGoalForDate(checkDate);

        if (dailyTotal >= goalForDate) {
          streak++;
        } else {
          break; // Streak broken
        }
      }

      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error calculating current streak:', error);
    }
  };

  const addWater = async (amount: number) => {
    try {
      await db.runAsync(
        'INSERT INTO water_log (drank_at, amount_ml) VALUES (?, ?)',
        [Date.now(), amount]
      );
      // Reload today's water intake and potentially streak after adding
      await Promise.all([
        loadTodayWaterIntake(),
        loadCurrentStreak() // Recalculate streak in case today's goal was just met
      ]);
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const resetToday = () => {
    Alert.alert(
      'Reset Today\'s Water Intake',
      'Are you sure you want to delete all water logs for today? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const startOfDay = today.getTime();
              const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1;

              await db.runAsync(
                'DELETE FROM water_log WHERE drank_at >= ? AND drank_at <= ?',
                [startOfDay, endOfDay]
              );

              // Reload data
              await Promise.all([
                loadTodayWaterIntake(),
                loadCurrentStreak()
              ]);
            } catch (error) {
              console.error('Error resetting today\'s water:', error);
            }
          }
        }
      ]
    );
  };

  // Calculate stats - only if data is loaded
  const remainingAmount = currentAmount !== null && goalAmount !== null
    ? Math.max(0, goalAmount - currentAmount)
    : null;
  const percentComplete = currentAmount !== null && goalAmount !== null
    ? Math.min(100, Math.round((currentAmount / goalAmount) * 100))
    : null;

  // Don't render until data is loaded
  if (currentAmount === null || goalAmount === null || currentStreak === null) {
    return (
      <View className="flex-1 bg-[#eaf6fb] justify-center items-center">
        <Text className="text-[#1793c6] text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#eaf6fb] px-4 pt-16">
      {/* Header */}
      <View className={`items-center ${Dimensions.get('window').height < 700 ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row gap-2 items-center">
          <WaterDrop />
          <Text className="text-4xl font-bold text-[#1793c6] mb-1">Hydrate</Text>
        </View>
        <Text className="text-base text-[#1793c6]">{getCurrentDate()}</Text>
      </View>

      {/* Progress Circle */}
      <WaterGoalAnimation currentAmount={currentAmount} goalAmount={goalAmount} />

      {/* Stats Row */}
      <View className={`flex-row justify-between ${Dimensions.get('window').height < 700 ? 'mb-3' : 'mb-6'}`}>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Feather name="target" size={24} color="#1793c6" />
          <Text className="text-xl font-bold text-[#1793c6]">{remainingAmount}</Text>
          <Text className="text-xs text-[#1793c6]">ml left</Text>
        </View>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Feather name="trending-up" size={24} color="#1793c6" />
          <Text className="text-xl font-bold text-[#1793c6]">{percentComplete}%</Text>
          <Text className="text-xs text-[#1793c6]">complete</Text>
        </View>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Feather name="calendar" size={24} color="#1793c6" />
          <Text className="text-xl font-bold text-[#1793c6]">{currentStreak}</Text>
          <Text className="text-xs text-[#1793c6]">day streak</Text>
        </View>
      </View>

      {/* Spacer to push Quick Add to bottom */}
      <View className="flex-1" />

      {/* Quick Add */}
      <Text className={`text-center text-lg font-semibold text-[#1793c6] ${Dimensions.get('window').height < 700 ? 'mb-1' : 'mb-2'}`}>Quick Add</Text>
      <View className={`flex-row justify-between ${Dimensions.get('window').height < 700 ? 'mb-2' : 'mb-3'}`}>
        <Pressable
          className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={() => addWater(250)}
        >
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">250ml</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={() => addWater(500)}
        >
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">500ml</Text>
        </Pressable>
      </View>
      <View className={`flex-row justify-between ${Dimensions.get('window').height < 700 ? 'mb-4' : 'mb-8'}`}>
        <Pressable
          className="flex-1 bg-[#1793c6] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={() => addWater(1000)}
        >
          <MaterialCommunityIcons name="cup-water" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">1L</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-[#d97d7d] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={resetToday}
        >
          <MaterialCommunityIcons name="restart" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">Reset</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}