import { Text, View } from "react-native";

export default function DashboardScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-2xl font-bold text-gray-800">Dashboard</Text>
            <Text className="mt-2 text-sm text-gray-400">Your overview — coming soon</Text>
        </View>
    );
}
