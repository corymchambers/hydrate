import { useSettingsStore } from '@/src/state/settingsStore';
import {
  convertFromMl,
  formatVolume,
  getUnitSuffix
} from '@/src/utils/conversions';
import { calculateCurrentStreak, getDailyGoalForDate, getDailyTotal } from '@/src/utils/streakCalculation';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ActivityEntry {
  id: number;
  amount_ml: number;
  drank_at: number;
}

interface DayData {
  date: Date;
  total: number;
  goal: number;
  percentage: number;
}

type TimePeriod = 'week' | 'month' | 'year' | 'ytd';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const [weeklyAverage, setWeeklyAverage] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [todayActivity, setTodayActivity] = useState<ActivityEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [periodData, setPeriodData] = useState<DayData[]>([]);
  const [periodAverage, setPeriodAverage] = useState<number>(0);
  const [daysGoalMet, setDaysGoalMet] = useState<number>(0);
  const [isPeriodLoading, setIsPeriodLoading] = useState<boolean>(false);

  useEffect(() => {
    loadHistoryData();
    loadPeriodData(); // Load initial data
  }, []);

  // Reload data when screen comes into focus (e.g., after returning from home screen)
  useFocusEffect(
    useCallback(() => {
      loadHistoryData();
      loadPeriodData();
    }, [])
  );

  const handlePeriodSelection = async (period: TimePeriod) => {
    if (isPeriodLoading) return;

    setIsPeriodLoading(true);
    setSelectedPeriod(period);

    try {
      const dates = getDateRange(period);
      const dayDataPromises = dates.map(async (date): Promise<DayData> => {
        const total = await getDailyTotal(db, date);
        const goal = await getDailyGoalForDate(db, date);
        const percentage = goal > 0 ? Math.round((total / goal) * 100) : 0;

        return {
          date,
          total,
          goal,
          percentage
        };
      });

      const dayData = await Promise.all(dayDataPromises);
      setPeriodData(dayData);

      // Calculate average percentage
      const totalPercentage = dayData.reduce((sum, day) => sum + day.percentage, 0);
      const average = dayData.length > 0 ? Math.round(totalPercentage / dayData.length) : 0;
      setPeriodAverage(average);

      // Calculate days that met goal
      const goalMetCount = dayData.filter(day => day.total >= day.goal).length;
      setDaysGoalMet(goalMetCount);

      // Update weekly average if this is the week period
      if (period === 'week') {
        setWeeklyAverage(average);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setIsPeriodLoading(false);
    }
  };

  const loadHistoryData = async () => {
    await Promise.all([
      loadTodayActivity(),
      loadCurrentStreak()
    ]);
  };

  const loadTodayActivity = async () => {
    try {
      // Get start and end of today
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await db.getAllAsync<ActivityEntry>(
        'SELECT id, amount_ml, drank_at FROM water_log WHERE drank_at >= ? AND drank_at <= ? ORDER BY drank_at DESC',
        [startOfDay.getTime(), endOfDay.getTime()]
      );
      setTodayActivity(result);
    } catch (error) {
      console.error('Error loading today\'s activity:', error);
    }
  };


  const getDateRange = (period: TimePeriod): Date[] => {
    const today = new Date();
    const dates: Date[] = [];

    switch (period) {
      case 'week':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date);
        }
        break;
      case 'month':
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date);
        }
        break;
      case 'year':
        // Last 365 days
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date);
        }
        break;
      case 'ytd':
        // Year to date
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const currentDate = new Date(startOfYear);
        while (currentDate <= today) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
    }
    return dates;
  };

  const loadPeriodData = async () => {
    try {
      const dates = getDateRange(selectedPeriod);
      const dayDataPromises = dates.map(async (date): Promise<DayData> => {
        const total = await getDailyTotal(db, date);
        const goal = await getDailyGoalForDate(db, date);
        const percentage = goal > 0 ? Math.round((total / goal) * 100) : 0;

        return {
          date,
          total,
          goal,
          percentage
        };
      });

      const dayData = await Promise.all(dayDataPromises);
      setPeriodData(dayData);

      // Calculate average percentage
      const totalPercentage = dayData.reduce((sum, day) => sum + day.percentage, 0);
      const average = dayData.length > 0 ? Math.round(totalPercentage / dayData.length) : 0;
      setPeriodAverage(average);

      // Update weekly average when loading week data initially
      if (selectedPeriod === 'week') {
        setWeeklyAverage(average);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: selectedPeriod === 'year' || selectedPeriod === 'ytd' ? 'numeric' : undefined
    });
  };

  const formatDayName = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const getPeriodTitle = (period: TimePeriod): string => {
    switch (period) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last Year';
      case 'ytd': return 'Year to Date';
    }
  };

  const loadCurrentStreak = async () => {
    try {
      const streak = await calculateCurrentStreak(db);
      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error calculating current streak:', error);
    }
  };

  const loadWeeklyAverage = async () => {
    try {
      const today = new Date();
      let totalPercentage = 0;
      let totalDays = 0;

      // Check the last 7 days and calculate average percentage
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);

        const dailyTotal = await getDailyTotal(db, checkDate);
        const goalForDate = await getDailyGoalForDate(db, checkDate);
        const percentage = goalForDate > 0 ? Math.round((dailyTotal / goalForDate) * 100) : 0;

        totalPercentage += percentage;
        totalDays++;
      }

      const average = totalDays > 0 ? Math.round(totalPercentage / totalDays) : 0;
      setWeeklyAverage(average);
    } catch (error) {
      console.error('Error calculating weekly average:', error);
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getActivityIcon = (amount: number) => {
    // Different cup icons based on amount
    if (amount >= 750) return 'cup-water';      // Full/large amount
    if (amount >= 300) return 'cup';            // Medium amount
    return 'cup-outline';                        // Small amount
  };

  const formatActivityAmount = (amountMl: number): string => {
    return formatVolume(amountMl, unitSystem || 'metric');
  };

  // Show loading state if data isn't loaded yet
  if (weeklyAverage === null || currentStreak === null) {
    return (
      <View className="flex-1 bg-[#eaf6fb] justify-center items-center">
        <Text className="text-[#1793c6] text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#eaf6fb]">
      <View className="px-4 pt-16 pb-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-[#1793c6] mb-1">History</Text>
          <Text className="text-base text-[#1793c6]">Track your hydration journey</Text>
        </View>

        {/* Stats Cards Row */}
        <View className="flex-row justify-between mb-6">
          {/* Weekly Average Card */}
          <View className="flex-1 bg-white rounded-xl p-6 shadow mr-2">
            <View className="items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mb-3">
                <Feather name="trending-up" size={24} color="#1793c6" />
              </View>
              <Text className="text-3xl font-bold text-[#2c3e50] mb-1">{weeklyAverage}%</Text>
              <Text className="text-sm text-[#7b8794] text-center">Weekly Average</Text>
            </View>
          </View>

          {/* Current Streak Card */}
          <View className="flex-1 bg-white rounded-xl p-6 shadow ml-2">
            <View className="items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mb-3">
                <Feather name="calendar" size={24} color="#1793c6" />
              </View>
              <Text className="text-3xl font-bold text-[#2c3e50] mb-1">{currentStreak}</Text>
              <Text className="text-sm text-[#7b8794] text-center">Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Today's Activity Card */}
        <View className="bg-white rounded-xl p-6 shadow mb-6">
          <Text className="text-xl font-bold text-[#2c3e50] mb-4">Today's Activity</Text>
          
          {todayActivity.length === 0 ? (
            <Text className="text-[#7b8794] text-center py-4">No activity today</Text>
          ) : (
            <View className="space-y-2">
              {todayActivity.map((activity, index) => (
                <View
                  key={activity.id}
                  className={`flex-row items-center py-3 ${
                    index !== todayActivity.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                  }`}
                >
                  <Text className="text-lg font-semibold text-[#2c3e50] flex-1">
                    {formatActivityAmount(activity.amount_ml)}
                  </Text>
                  <Text className="text-sm text-[#7b8794]">{formatTime(activity.drank_at)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Period Analysis Card */}
        <View className="bg-white rounded-xl p-6 shadow relative">
          {/* Loading Overlay */}
          {isPeriodLoading && (
            <View className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center z-10">
              <ActivityIndicator size="large" color="#1793c6" />
              <Text className="text-[#1793c6] mt-2 font-medium">Loading data...</Text>
            </View>
          )}
          
          {/* Period Selector */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-[#2c3e50] mb-3">Analysis</Text>
            <View className="flex-row justify-between">
              {(['week', 'month', 'year', 'ytd'] as TimePeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => handlePeriodSelection(period)}
                  disabled={isPeriodLoading}
                  className={`flex-1 py-2 px-3 mx-1 rounded-lg ${
                    selectedPeriod === period 
                      ? 'bg-[#1793c6]' 
                      : 'bg-[#f0f0f0]'
                  }`}
                >
                  <Text 
                    className={`text-center text-sm font-medium ${
                      selectedPeriod === period 
                        ? 'text-white' 
                        : 'text-[#7b8794]'
                    }`}
                  >
                    {period === 'week' ? '7D' : 
                     period === 'month' ? '30D' : 
                     period === 'year' ? '1Y' : 'YTD'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period Summary */}
          <View className="bg-[#f8f9fa] rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-[#2c3e50] mb-1">
                  {getPeriodTitle(selectedPeriod)}
                </Text>
                <Text className="text-2xl font-bold text-[#1793c6]">
                  {periodAverage}% Overall Average
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-[#7b8794] mb-1">Goal Achievement</Text>
                <Text className="text-lg font-bold text-[#2c3e50]">
                  {daysGoalMet}/{periodData.length} days
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Breakdown */}
          <View>
            {periodData.slice().reverse().map((day, index) => (
                <View key={index} className="flex-row items-center py-4 border-b border-[#f0f0f0] last:border-b-0">
                  {/* Date */}
                  <View className="w-20">
                    <Text className="text-sm font-medium text-[#2c3e50]">
                      {formatDayName(day.date)}
                    </Text>
                    <Text className="text-xs text-[#7b8794]">
                      {formatDate(day.date)}
                    </Text>
                  </View>
                  
                  {/* Progress Bar Section */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-[#7b8794]">
                        {Math.round(convertFromMl(day.total, unitSystem))}{getUnitSuffix(unitSystem)} / {Math.round(convertFromMl(day.goal, unitSystem))}{getUnitSuffix(unitSystem)}
                      </Text>
                      <Text className={`text-sm font-bold ${
                        day.percentage >= 100 ? 'text-[#22c55e]' : 'text-[#7b8794]'
                      }`}>
                        {day.percentage}%
                      </Text>
                    </View>
                    <View className="h-3 bg-[#e1f5fe] rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          day.percentage >= 100 ? 'bg-[#22c55e]' : 'bg-[#1793c6]'
                        }`}
                        style={{ width: `${Math.min(day.percentage, 100)}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* Spacer for bottom padding */}
        <View className="h-8" />
      </View>
    </ScrollView>
  );
}