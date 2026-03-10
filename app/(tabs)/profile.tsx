import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
    const handleLogout = () => {
        // TODO: Clear auth session/token here
        router.replace("/(auth)/login");
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="items-center px-6 pb-6 pt-16">
                <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons name="person" size={36} color="#2563EB" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Your Profile</Text>
                <Text className="text-sm text-gray-400">Manage your account</Text>
            </View>

            <View className="flex-1 px-6">
                {/* Placeholder content */}
                <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
                    <Text className="text-sm font-medium text-gray-400">
                        Profile details coming soon...
                    </Text>
                </View>

                {/* Logout button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl bg-red-50 py-4"
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text className="ml-2 text-base font-semibold text-red-500">
                        Log Out
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
