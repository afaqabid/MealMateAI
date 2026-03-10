import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <View className="rounded-2xl bg-blue-600 px-8 py-6 shadow-lg">
        <Text className="text-2xl font-bold text-white">
          ✅ NativeWind is working!
        </Text>
        <Text className="mt-2 text-center text-sm text-blue-100">
          Tailwind classes are applying correctly.
        </Text>
      </View>
    </View>
  );
}
