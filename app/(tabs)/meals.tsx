import { Text, View } from "react-native";

export default function MealsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-2xl font-bold text-gray-800">Meals</Text>
            <Text className="mt-2 text-sm text-gray-400">Your meal plans — coming soon</Text>
        </View>
    );
}
