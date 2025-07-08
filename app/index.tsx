import { Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#eaf6fb] px-4 pt-16">
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-4xl font-bold text-[#1793c6] mb-1">💧 Hydrate</Text>
        <Text className="text-base text-[#1793c6]">Sunday, June 29</Text>
      </View>

      {/* Progress Circle Placeholder */}
      <View className="items-center justify-center mb-6">
        <View className="w-56 h-56 rounded-full border-8 border-[#1793c6] border-t-[#eaf6fb] items-center justify-center bg-[#d2f0fa] opacity-80">
          <Text className="text-3xl font-bold text-[#1793c6]">750ml</Text>
          <Text className="text-base text-[#1793c6]">of 2000ml goal</Text>
          <Text className="text-xl font-semibold text-[#1793c6] mt-2">38%</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between mb-6">
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Text className="text-xl font-bold text-[#1793c6]">1250</Text>
          <Text className="text-xs text-[#1793c6]">ml left</Text>
        </View>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Text className="text-xl font-bold text-[#1793c6]">38%</Text>
          <Text className="text-xs text-[#1793c6]">complete</Text>
        </View>
        <View className="flex-1 items-center bg-white rounded-xl py-4 mx-1 shadow">
          <Text className="text-xl font-bold text-[#1793c6]">5</Text>
          <Text className="text-xs text-[#1793c6]">day streak</Text>
        </View>
      </View>

      {/* Spacer to push Quick Add to bottom */}
      <View className="flex-1" />

      {/* Quick Add */}
      <Text className="text-center text-lg font-semibold text-[#1793c6] mb-2">Quick Add</Text>
      <View className="flex-row justify-between mb-3">
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center">
          <Text className="text-white font-bold">250ml</Text>
        </Pressable>
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center">
          <Text className="text-white font-bold">500ml</Text>
        </Pressable>
      </View>
      <View className="flex-row justify-between mb-8">
        <Pressable className="flex-1 bg-[#1cc6e4] rounded-xl py-4 mx-1 items-center">
          <Text className="text-white font-bold">750ml</Text>
        </Pressable>
        <Pressable className="flex-1 bg-[#1793c6] rounded-xl py-4 mx-1 items-center">
          <Text className="text-white font-bold">1L</Text>
        </Pressable>
      </View>
    </View>
  );
}
