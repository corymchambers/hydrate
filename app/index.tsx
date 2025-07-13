import WaterDrop from '@/components/WaterDrop';
import WaterGoalAnimation from '@/components/WaterGoalAnimation';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [goalAmount, setGoalAmount] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadDailyGoal(),
      loadTodayWaterIntake()
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

  const addWater = async (amount: number) => {
    try {
      await db.runAsync(
        'INSERT INTO water_log (drank_at, amount_ml) VALUES (?, ?)',
        [Date.now(), amount]
      );
      // Reload today's water intake after adding
      await loadTodayWaterIntake();
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  // Calculate stats - only if data is loaded
  const remainingAmount = currentAmount !== null && goalAmount !== null
    ? Math.max(0, goalAmount - currentAmount)
    : null;
  const percentComplete = currentAmount !== null && goalAmount !== null
    ? Math.min(100, Math.round((currentAmount / goalAmount) * 100))
    : null;

  // Don't render until data is loaded
  if (currentAmount === null || goalAmount === null) {
    return (
      <View className="flex-1 bg-[#eaf6fb] justify-center items-center">
        <Text className="text-[#1793c6] text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#eaf6fb] px-4 pt-16">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="flex-row gap-2 items-center">
          <WaterDrop />
          <Text className="text-4xl font-bold text-[#1793c6] mb-1">Hydrate</Text>
        </View>
        <Text className="text-base text-[#1793c6]">Sunday, June 29</Text>
      </View>

      {/* Progress Circle */}
      <WaterGoalAnimation currentAmount={currentAmount} goalAmount={goalAmount} />

      {/* Stats Row */}
      <View className="flex-row justify-between mb-6">
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
          <Text className="text-xl font-bold text-[#1793c6]">5</Text>
          <Text className="text-xs text-[#1793c6]">day streak</Text>
        </View>
      </View>

      {/* Spacer to push Quick Add to bottom */}
      <View className="flex-1" />

      {/* Quick Add */}
      <Text className="text-center text-lg font-semibold text-[#1793c6] mb-2">Quick Add</Text>
      <View className="flex-row justify-between mb-3">
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
      <View className="flex-row justify-between mb-8">
        <Pressable
          className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={() => addWater(750)}
        >
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">750ml</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-[#1793c6] rounded-xl py-4 mx-1 items-center flex-row justify-center"
          onPress={() => addWater(1000)}
        >
          <MaterialCommunityIcons name="cup-water" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">1L</Text>
        </Pressable>
      </View>
    </View>
  );
}