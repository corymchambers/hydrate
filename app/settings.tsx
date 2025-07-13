import { UnitSystem, useSettingsStore } from '@/src/state/settingsStore';
import { Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const [dailyGoal, setDailyGoal] = useState<number | string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTempGoal(dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    loadDailyGoal();
  }, []);

  const loadDailyGoal = async () => {
    try {
      const result = await db.getFirstAsync<{ goal_ml: number }>(
        'SELECT goal_ml FROM goal_history ORDER BY changed_at DESC LIMIT 1'
      );
      if (result) {
        setDailyGoal(result.goal_ml);
      }
    } catch (error) {
      console.error('Error loading daily goal:', error);
    }
  };

  const saveDailyGoal = async (newGoal: number) => {
    try {
      await db.runAsync(
        'INSERT INTO goal_history (changed_at, goal_ml) VALUES (?, ?)',
        [Date.now(), newGoal]
      );
      setDailyGoal(newGoal);
    } catch (error) {
      console.error('Error saving daily goal:', error);
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
    setTempGoal(dailyGoal.toString());
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSave = async () => {
    const newGoal = parseInt(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      await saveDailyGoal(newGoal)
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempGoal(dailyGoal.toString());
    setIsEditing(false);
  };

  return (
    <View className="flex-1 bg-[#eaf6fb] px-4 pt-16">
      {/* Header */}
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-[#1793c6] mb-1">Settings</Text>
        <Text className="text-base text-[#1793c6]">Customize your hydration experience</Text>
      </View>

      {/* Settings Cards */}
      <View>
        {/* Daily Goal Card */}
        <View className="bg-white rounded-xl p-6 shadow mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="target" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Daily Goal</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Set your hydration target</Text>
                {isEditing ? (
                  <View className="flex-row items-center mt-1">
                    <TextInput
                      ref={inputRef}
                      value={tempGoal}
                      onChangeText={setTempGoal}
                      keyboardType="number-pad"
                      className="text-lg font-bold text-[#1793c6] bg-gray-100 px-2 py-1 rounded min-w-[60px] text-center mr-1"
                      maxLength={5}
                      selectTextOnFocus={true}
                      onSubmitEditing={handleSave}
                    />
                    <Text className="text-lg font-bold text-[#1793c6]">ml</Text>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-[#1793c6] mt-1">{dailyGoal}ml</Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center">
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={handleSave} className="mr-2">
                    <Feather name="check" size={20} color="#22c55e" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancel}>
                    <Feather name="x" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleEditPress}>
                  <Feather name="edit-2" size={20} color="#1793c6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Notifications Card */}
        <Pressable className="bg-white rounded-xl p-6 shadow mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="bell" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Units</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Choose your preferred system</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-[#1793c6] mr-2">On</Text>
              <Feather name="chevron-right" size={20} color="#1793c6" />
            </View>
          </View>
        </Pressable>

        {/* Profile Card */}
        <Pressable className="bg-white rounded-xl p-6 shadow">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="user" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Quick Add</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Customize your shortcuts</Text>
              </View>
            </View>
            <View >
              {['metric', 'imperial'].map(u => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnitSystem(u as UnitSystem)}
                >
                  <Text >
                    {u === 'metric' ? 'Metric' : 'Imperial'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}