import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

type Unit = "kg" | "lbs";

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const [weight, setWeight] = useState("70");
    const [height, setHeight] = useState("170");
    const [dailyGoal, setDailyGoal] = useState("2000");
    const [unit, setUnit] = useState<Unit>("kg");
    const [darkMode, setDarkMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const name = user?.user_metadata?.full_name ?? "User";
    const email = user?.email ?? "";

    // Load profile on mount — auto-creates a default row if none exists
    useEffect(() => {
        if (!user?.id) return;
        const loadProfile = async () => {
            // Ensure a row exists (idempotent — safe to call every time)
            await supabase
                .from("user_profiles")
                .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

            // Now fetch it
            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setWeight(String(data.weight ?? 70));
                setHeight(String(data.height ?? 170));
                setDailyGoal(String(data.daily_goal ?? 2000));
                setUnit((data.unit as Unit) ?? "kg");
            }
            setLoadingProfile(false);
        };
        loadProfile();
    }, [user?.id]);


    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        const payload = {
            id: user.id,
            weight: parseFloat(weight) || 70,
            height: parseFloat(height) || 170,
            daily_goal: parseInt(dailyGoal) || 2000,
            unit,
            updated_at: new Date().toISOString(),
        };
        // Upsert — creates row if it doesn't exist, updates if it does
        const { error } = await supabase.from("user_profiles").upsert(payload);
        setSaving(false);
        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } else {
            Alert.alert("Error", error.message);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This will permanently delete your account and all data. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="bg-white px-6 pb-5 pt-14">
                <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            </View>

            {/* Avatar + Info */}
            <View className="mx-4 mt-4 items-center rounded-3xl bg-white py-6" style={{ elevation: 2 }}>
                <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <Text className="text-3xl font-bold text-blue-600">
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text className="text-lg font-bold text-gray-900">{name}</Text>
                <Text className="text-sm text-gray-400">{email}</Text>
                <View className={`mt-2 flex-row items-center rounded-full px-3 py-1 ${user?.email_confirmed_at ? "bg-green-100" : "bg-orange-100"}`}>
                    <Ionicons
                        name={user?.email_confirmed_at ? "shield-checkmark" : "alert-circle"}
                        size={12}
                        color={user?.email_confirmed_at ? "#16A34A" : "#F97316"}
                    />
                    <Text className={`ml-1 text-xs font-medium ${user?.email_confirmed_at ? "text-green-700" : "text-orange-600"}`}>
                        {user?.email_confirmed_at ? "Email verified" : "Email not verified"}
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View className="mx-4 mt-4 rounded-3xl bg-white p-5" style={{ elevation: 2 }}>
                <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    My Stats
                </Text>

                {loadingProfile ? (
                    <ActivityIndicator color="#2563EB" />
                ) : (
                    <>
                        {[
                            { label: "Weight", value: weight, onChange: setWeight, suffix: unit },
                            { label: "Height", value: height, onChange: setHeight, suffix: "cm" },
                            { label: "Daily Calorie Goal", value: dailyGoal, onChange: setDailyGoal, suffix: "kcal" },
                        ].map((field, i, arr) => (
                            <View
                                key={field.label}
                                className={`flex-row items-center py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                                <Text className="flex-1 text-sm font-medium text-gray-700">{field.label}</Text>
                                <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                    <TextInput
                                        className="w-16 text-right text-sm font-bold text-gray-900"
                                        value={field.value}
                                        onChangeText={field.onChange}
                                        keyboardType="numeric"
                                    />
                                    <Text className="ml-1 text-xs text-gray-400">{field.suffix}</Text>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            className={`mt-4 items-center rounded-xl py-3.5 ${saved ? "bg-green-500" : saving ? "bg-blue-400" : "bg-blue-600"}`}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : saved ? (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                    <Text className="ml-2 text-sm font-semibold text-white">Saved!</Text>
                                </View>
                            ) : (
                                <Text className="text-sm font-semibold text-white">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Settings */}
            <View className="mx-4 mt-4 rounded-3xl bg-white p-5" style={{ elevation: 2 }}>
                <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Settings
                </Text>

                {/* Units */}
                <View className="mb-4 flex-row items-center justify-between border-b border-gray-100 pb-4">
                    <View className="flex-row items-center">
                        <Ionicons name="scale-outline" size={18} color="#6B7280" />
                        <Text className="ml-3 text-sm font-medium text-gray-700">Units</Text>
                    </View>
                    <View className="flex-row overflow-hidden rounded-xl border border-gray-200">
                        {(["kg", "lbs"] as Unit[]).map((u) => (
                            <TouchableOpacity
                                key={u}
                                onPress={() => setUnit(u)}
                                className={`px-4 py-2 ${unit === u ? "bg-blue-600" : "bg-white"}`}
                            >
                                <Text className={`text-sm font-semibold ${unit === u ? "text-white" : "text-gray-500"}`}>
                                    {u}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Dark Mode */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="moon-outline" size={18} color="#6B7280" />
                        <Text className="ml-3 text-sm font-medium text-gray-700">Dark Mode</Text>
                    </View>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Account */}
            <View className="mx-4 mt-4 rounded-3xl bg-white p-5" style={{ elevation: 2 }}>
                <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Account
                </Text>

                <TouchableOpacity
                    className="mb-3 flex-row items-center justify-center rounded-xl bg-red-50 py-4"
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text className="ml-2 text-sm font-semibold text-red-500">Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl border border-red-200 py-4"
                    onPress={handleDeleteAccount}
                    activeOpacity={0.85}
                >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text className="ml-2 text-sm font-semibold text-red-500">Delete Account</Text>
                </TouchableOpacity>
            </View>

            <View className="h-10" />
        </ScrollView>
    );
}
