import { UnitSystem, useSettingsStore } from '@/src/state/settingsStore';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);

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
        <Pressable className="bg-white rounded-xl p-6 shadow mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#e3f2fd] rounded-full p-3 mr-4">
                <Feather name="target" size={24} color="#1793c6" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-[#1793c6]">Daily Goal</Text>
                <Text className="text-sm text-[#1793c6] opacity-70">Set your hydration target</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-[#1793c6] mr-2">2000ml</Text>
              <Feather name="chevron-right" size={20} color="#1793c6" />
            </View>
          </View>
        </Pressable>

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