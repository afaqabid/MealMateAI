import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface Meal {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    eaten_at: string;
}


// --- Calorie Ring ---
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
    const size = 180;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(consumed / goal, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
                <G>
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EFF6FF" strokeWidth={strokeWidth} fill="none" />
                    <Circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={consumed > goal ? "#EF4444" : "#2563EB"}
                        strokeWidth={strokeWidth} fill="none"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>
            <View className="absolute items-center">
                <Text className="text-3xl font-bold text-gray-900">{consumed}</Text>
                <Text className="text-xs text-gray-400">of {goal} kcal</Text>
                <Text className={`mt-1 text-xs font-medium ${consumed > goal ? "text-red-500" : "text-blue-600"}`}>
                    {consumed > goal ? `${consumed - goal} over` : `${goal - consumed} left`}
                </Text>
            </View>
        </View>
    );
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const MEAL_ICONS = ["🍳", "🥣", "🥑", "🌯", "🥗", "🍕", "🍝", "🍱", "🥩", "🐟", "🥐", "🍜", "🍛", "🥪", "🥙", "🌮", "🥘", "🍲"];
function mealIcon(name: string) {
    const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return MEAL_ICONS[hash % MEAL_ICONS.length];
}

export default function DashboardScreen() {
    const { user } = useAuth();
    const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    const [meals, setMeals] = useState<Meal[]>([]);
    const [dailyGoal, setDailyGoal] = useState(2000);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [mealsRes, profileRes] = await Promise.all([
            supabase
                .from("meals")
                .select("*")
                .gte("eaten_at", todayStart.toISOString())
                .order("eaten_at", { ascending: false }),
            supabase
                .from("user_profiles")
                .select("daily_goal")
                .single(),
        ]);

        if (!mealsRes.error && mealsRes.data) setMeals(mealsRes.data);
        if (!profileRes.error && profileRes.data?.daily_goal) {
            setDailyGoal(profileRes.data.daily_goal);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const totals = meals.reduce(
        (acc, m) => ({ kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        >
            {/* Header */}
            <View className="bg-white px-6 pb-5 pt-14">
                <Text className="text-sm text-gray-400">{today}</Text>
                <Text className="mt-0.5 text-2xl font-bold text-gray-900">Hey, {name} 👋</Text>
            </View>

            {/* Calorie Card */}
            <View className="mx-4 mt-4 rounded-3xl bg-white p-6" style={{ elevation: 2 }}>
                <Text className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">Today's Calories</Text>
                {loading ? (
                    <View className="items-center py-16"><ActivityIndicator size="large" color="#2563EB" /></View>
                ) : (
                    <>
                        <CalorieRing consumed={totals.kcal} goal={dailyGoal} />
                        <View className="mt-5 flex-row justify-around">
                            {[
                                { label: "Protein", val: `${totals.protein}g`, color: "bg-blue-100", text: "text-blue-700" },
                                { label: "Carbs", val: `${totals.carbs}g`, color: "bg-amber-100", text: "text-amber-700" },
                                { label: "Fat", val: `${totals.fat}g`, color: "bg-rose-100", text: "text-rose-700" },
                            ].map((m) => (
                                <View key={m.label} className={`items-center rounded-2xl px-5 py-2 ${m.color}`}>
                                    <Text className={`text-base font-bold ${m.text}`}>{m.val}</Text>
                                    <Text className={`text-xs ${m.text}`}>{m.label}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            {/* AI Suggestion */}
            {!loading && (
                <View className="mx-4 mt-4 overflow-hidden rounded-3xl bg-blue-600">
                    <View className="flex-row items-start p-5">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <Ionicons name="sparkles" size={18} color="#fff" />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-200">AI Suggestion</Text>
                            <Text className="text-sm leading-5 text-white">
                                {totals.kcal === 0
                                    ? "🌅 Start your day! Log your first meal to track your progress."
                                    : totals.kcal < dailyGoal * 0.5
                                        ? `💪 Great start! You have ${dailyGoal - totals.kcal} kcal remaining — keep going!`
                                        : totals.kcal < dailyGoal
                                            ? `🥗 Almost there! ${dailyGoal - totals.kcal} kcal left — consider a light snack.`
                                            : `✅ Goal reached! You've hit ${totals.kcal} kcal. Stay hydrated!`}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Recent Meals */}
            <View className="mx-4 mt-4 mb-6 rounded-3xl bg-white p-5" style={{ elevation: 2 }}>
                <Text className="mb-3 text-base font-bold text-gray-900">Today's Meals</Text>
                {loading ? (
                    <ActivityIndicator color="#2563EB" />
                ) : meals.length === 0 ? (
                    <View className="items-center py-6">
                        <Ionicons name="restaurant-outline" size={36} color="#E5E7EB" />
                        <Text className="mt-2 text-sm text-gray-400">No meals logged yet today</Text>
                        <Text className="text-xs text-gray-300">Tap + to add your first meal</Text>
                    </View>
                ) : (
                    meals.slice(0, 5).map((meal) => (
                        <View key={meal.id} className="flex-row items-center border-b border-gray-50 py-3 last:border-0">
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                                <Text className="text-xl">{mealIcon(meal.name)}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-800">{meal.name}</Text>
                                <Text className="text-xs text-gray-400">{formatTime(meal.eaten_at)}</Text>
                            </View>
                            <Text className="text-sm font-bold text-gray-700">{meal.kcal} kcal</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
