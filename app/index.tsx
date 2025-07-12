import WaterDrop from '@/components/WaterDrop';
import WaterGoalAnimation from '@/components/WaterGoalAnimation';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
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

      {/* Progress Circle Placeholder */}
      <WaterGoalAnimation currentMl={500} goalMl={1000} />

      {/* Stats Row */}
      <View className="flex-row justify-between mb-6">
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Feather name="target" size={24} color="#1793c6" />
          <Text className="text-xl font-bold text-[#1793c6]">1250</Text>
          <Text className="text-xs text-[#1793c6]">ml left</Text>
        </View>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Feather name="trending-up" size={24} color="#1793c6" />
          <Text className="text-xl font-bold text-[#1793c6]">38%</Text>
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
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center">
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">250ml</Text>
        </Pressable>
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center">
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">500ml</Text>
        </Pressable>
      </View>
      <View className="flex-row justify-between mb-8">
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center flex-row justify-center">
          <MaterialCommunityIcons name="cup" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">750ml</Text>
        </Pressable>
        <Pressable className="flex-1 bg-[#1793c6] rounded-xl py-4 mx-1 items-center flex-row justify-center">
          <MaterialCommunityIcons name="cup-water" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">1L</Text>
        </Pressable>
      </View>
    </View>
  );
}
