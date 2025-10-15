import { UnitSystem, useSettingsStore } from '@/src/state/settingsStore';
import {
  convertFromMl,
  convertToMl,
  getUnitSuffix
} from '@/src/utils/conversions';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const quickAddButtons = useSettingsStore((s) => s.quickAddButtons);
  const setQuickAddButtons = useSettingsStore((s) => s.setQuickAddButtons);
  const [dailyGoal, setDailyGoal] = useState<number | string>('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  const [isEditingUnits, setIsEditingUnits] = useState(false);
  const [tempUnit, setTempUnit] = useState<UnitSystem>(unitSystem || 'metric');
  const [isEditingQuickAdd, setIsEditingQuickAdd] = useState(false);
  const [tempQuickAdd, setTempQuickAdd] = useState<[string, string, string]>(['', '', '']);
  const inputRef = useRef<TextInput>(null);
  const quickAdd1Ref = useRef<TextInput>(null);
  const quickAdd2Ref = useRef<TextInput>(null);
  const quickAdd3Ref = useRef<TextInput>(null);

  useEffect(() => {
    setTempGoal(dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    setTempUnit(unitSystem || 'metric');
  }, [unitSystem]);

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

  const handleEditGoalPress = () => {
    setIsEditingGoal(true);
    // Set temp goal in current unit system
    const displayGoal = typeof dailyGoal === 'number'
      ? convertFromMl(dailyGoal, unitSystem || 'metric').toString()
      : '';
    setTempGoal(displayGoal);
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSaveGoal = async () => {
    const inputValue = parseFloat(tempGoal);
    if (!isNaN(inputValue) && inputValue > 0) {
      // Convert to ml for storage
      const goalInMl = convertToMl(inputValue, unitSystem || 'metric');
      await saveDailyGoal(goalInMl);
      setIsEditingGoal(false);
    }
  };

  const handleCancelGoal = () => {
    const displayGoal = typeof dailyGoal === 'number'
      ? convertFromMl(dailyGoal, unitSystem || 'metric').toString()
      : '';
    setTempGoal(displayGoal);
    setIsEditingGoal(false);
  };

  const handleEditUnitsPress = () => {
    setIsEditingUnits(true);
    setTempUnit(unitSystem || 'metric');
  };

  const handleSaveUnits = () => {
    // Update temp goal when unit system changes
    if (typeof dailyGoal === 'number') {
      const displayGoal = convertFromMl(dailyGoal, tempUnit).toString();
      setTempGoal(displayGoal);
    }
    setUnitSystem(tempUnit);
    setIsEditingUnits(false);
  };

  const handleCancelUnits = () => {
    setTempUnit(unitSystem || 'metric');
    setIsEditingUnits(false);
  };

  const handleEditQuickAddPress = () => {
    setIsEditingQuickAdd(true);
    // Convert buttons to display units
    const displayButtons: [string, string, string] = [
      convertFromMl(quickAddButtons[0], unitSystem || 'metric').toString(),
      convertFromMl(quickAddButtons[1], unitSystem || 'metric').toString(),
      convertFromMl(quickAddButtons[2], unitSystem || 'metric').toString(),
    ];
    setTempQuickAdd(displayButtons);
    // Focus first input after state update
    setTimeout(() => {
      quickAdd1Ref.current?.focus();
    }, 100);
  };

  const handleSaveQuickAdd = () => {
    const button1 = parseFloat(tempQuickAdd[0]);
    const button2 = parseFloat(tempQuickAdd[1]);
    const button3 = parseFloat(tempQuickAdd[2]);

    // Validate all three inputs - must be valid numbers greater than 0
    if (isNaN(button1) || button1 <= 0) {
      Alert.alert('Invalid Value', 'You must enter a value greater than 0.');
      return;
    }
    if (isNaN(button2) || button2 <= 0) {
      Alert.alert('Invalid Value', 'You must enter a value greater than 0.');
      return;
    }
    if (isNaN(button3) || button3 <= 0) {
      Alert.alert('Invalid Value', 'You must enter a value greater than 0.');
      return;
    }

    // Convert to ml for storage
    const buttonsInMl: [number, number, number] = [
      convertToMl(button1, unitSystem || 'metric'),
      convertToMl(button2, unitSystem || 'metric'),
      convertToMl(button3, unitSystem || 'metric'),
    ];
    setQuickAddButtons(buttonsInMl);
    setIsEditingQuickAdd(false);
  };

  const handleCancelQuickAdd = () => {
    const displayButtons: [string, string, string] = [
      convertFromMl(quickAddButtons[0], unitSystem || 'metric').toString(),
      convertFromMl(quickAddButtons[1], unitSystem || 'metric').toString(),
      convertFromMl(quickAddButtons[2], unitSystem || 'metric').toString(),
    ];
    setTempQuickAdd(displayButtons);
    setIsEditingQuickAdd(false);
  };

  const getUnitDisplayName = (unit: UnitSystem) => {
    return unit === 'metric' ? 'ml' : 'fl oz';
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#eaf6fb]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        className="flex-1 px-4 pt-16"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
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
                {isEditingGoal ? (
                  <View className="flex-row items-center mt-1">
                    <TextInput
                      ref={inputRef}
                      value={tempGoal}
                      onChangeText={setTempGoal}
                      keyboardType="numeric"
                      className="text-lg font-bold text-[#1793c6] bg-gray-100 px-2 py-1 rounded min-w-[60px] text-center mr-1"
                      maxLength={5}
                      selectTextOnFocus={true}
                      returnKeyType="done"
                      onSubmitEditing={handleSaveGoal}
                    />
                    <Text className="text-lg font-bold text-[#1793c6]">
                      {getUnitSuffix(unitSystem || 'metric')}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-[#1793c6] mt-1">
                    {typeof dailyGoal === 'number'
                      ? convertFromMl(dailyGoal, unitSystem || 'metric')
                      : ''}{getUnitSuffix(unitSystem || 'metric')}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center">
              {isEditingGoal ? (
                <>
                  <TouchableOpacity onPress={handleSaveGoal} className="mr-2">
                    <Feather name="check" size={20} color="#22c55e" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelGoal}>
                    <Feather name="x" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleEditGoalPress}>
                  <Feather name="edit-2" size={20} color="#1793c6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Units Card */}
        <View className="bg-white rounded-xl p-6 shadow mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="globe" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Units</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Choose your preferred system</Text>
                {isEditingUnits ? (
                  <View className="mt-2">
                    <View className="flex-row bg-gray-100 rounded-lg p-1">
                      <TouchableOpacity
                        onPress={() => setTempUnit('metric')}
                        className={`flex-1 py-2 px-3 rounded-md ${tempUnit === 'metric' ? 'bg-[#1793c6]' : 'bg-transparent'
                          }`}
                      >
                        <Text className={`text-center text-sm font-medium ${tempUnit === 'metric' ? 'text-white' : 'text-[#7b8794]'
                          }`}>
                          ml
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setTempUnit('imperial')}
                        className={`flex-1 py-2 px-3 rounded-md ${tempUnit === 'imperial' ? 'bg-[#1793c6]' : 'bg-transparent'
                          }`}
                      >
                        <Text className={`text-center text-sm font-medium ${tempUnit === 'imperial' ? 'text-white' : 'text-[#7b8794]'
                          }`}>
                          fl oz
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-[#1793c6] mt-1">
                    {getUnitDisplayName(unitSystem || 'metric')}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center">
              {isEditingUnits ? (
                <>
                  <TouchableOpacity onPress={handleSaveUnits} className="mr-2">
                    <Feather name="check" size={20} color="#22c55e" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelUnits}>
                    <Feather name="x" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleEditUnitsPress}>
                  <Feather name="edit-2" size={20} color="#1793c6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Quick Add Card */}
        <View className="bg-white rounded-xl p-6 shadow">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="zap" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Quick Add</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Customize your shortcuts</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {isEditingQuickAdd ? (
                <>
                  <TouchableOpacity onPress={handleSaveQuickAdd} className="mr-2">
                    <Feather name="check" size={20} color="#22c55e" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelQuickAdd}>
                    <Feather name="x" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleEditQuickAddPress}>
                  <Feather name="edit-2" size={20} color="#1793c6" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Button Values */}
          {isEditingQuickAdd ? (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-[#7b8794] w-24">{convertFromMl(quickAddButtons[0], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}:</Text>
                <View className="flex-row items-center flex-1">
                  <TextInput
                    ref={quickAdd1Ref}
                    value={tempQuickAdd[0]}
                    onChangeText={(val) => setTempQuickAdd([val, tempQuickAdd[1], tempQuickAdd[2]])}
                    keyboardType="numeric"
                    className="flex-1 text-base text-[#1793c6] bg-gray-100 px-3 py-2 rounded mr-2"
                    maxLength={5}
                    selectTextOnFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text className="text-sm text-[#7b8794]">{getUnitSuffix(unitSystem || 'metric')}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-[#7b8794] w-24">{convertFromMl(quickAddButtons[1], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}:</Text>
                <View className="flex-row items-center flex-1">
                  <TextInput
                    ref={quickAdd2Ref}
                    value={tempQuickAdd[1]}
                    onChangeText={(val) => setTempQuickAdd([tempQuickAdd[0], val, tempQuickAdd[2]])}
                    keyboardType="numeric"
                    className="flex-1 text-base text-[#1793c6] bg-gray-100 px-3 py-2 rounded mr-2"
                    maxLength={5}
                    selectTextOnFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text className="text-sm text-[#7b8794]">{getUnitSuffix(unitSystem || 'metric')}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-[#7b8794] w-24">{convertFromMl(quickAddButtons[2], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}:</Text>
                <View className="flex-row items-center flex-1">
                  <TextInput
                    ref={quickAdd3Ref}
                    value={tempQuickAdd[2]}
                    onChangeText={(val) => setTempQuickAdd([tempQuickAdd[0], tempQuickAdd[1], val])}
                    keyboardType="numeric"
                    className="flex-1 text-base text-[#1793c6] bg-gray-100 px-3 py-2 rounded mr-2"
                    maxLength={5}
                    selectTextOnFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text className="text-sm text-[#7b8794]">{getUnitSuffix(unitSystem || 'metric')}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-[#1793c6]">
                {convertFromMl(quickAddButtons[0], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}
              </Text>
              <Text className="text-base font-semibold text-[#1793c6]">
                {convertFromMl(quickAddButtons[1], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}
              </Text>
              <Text className="text-base font-semibold text-[#1793c6]">
                {convertFromMl(quickAddButtons[2], unitSystem || 'metric')}{getUnitSuffix(unitSystem || 'metric')}
              </Text>
            </View>
          )}
        </View>

        {/* Version Info */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-xs text-[#1793c6] opacity-50">
            Version {Constants.expoConfig?.version || '1.0.0'} • Build {Platform.OS === 'ios'
              ? (Constants.expoConfig?.ios?.buildNumber || '7')
              : (Constants.expoConfig?.android?.versionCode || '8')}
          </Text>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}