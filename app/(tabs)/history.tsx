import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { supabase } from "../../lib/supabase";

type Period = "Day" | "Week" | "Month";

interface Meal {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    eaten_at: string;
}

interface DayGroup {
    date: string;
    label: string;
    total: number;
    meals: Meal[];
}

const GOAL = 2000;

const MEAL_ICONS = ["🍳", "🥣", "🥑", "🌯", "🥗", "🍕", "🍝", "🍱", "🥩", "🐟", "🥐", "🍜", "🍛", "🥪", "🥙", "🌮", "🥘", "🍲"];
function mealIcon(name: string) {
    const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return MEAL_ICONS[hash % MEAL_ICONS.length];
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function toLocalDateKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateLabel(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    const d = new Date(year, month, day);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (toLocalDateKey(d.toISOString()) === toLocalDateKey(today.toISOString())) return "Today";
    if (toLocalDateKey(d.toISOString()) === toLocalDateKey(yesterday.toISOString())) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// --- Weekly Bar Chart ---
function WeeklyChart({ meals }: { meals: Meal[] }) {
    // Build last-7-days buckets
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2), key: toLocalDateKey(d.toISOString()), kcal: 0 };
    });

    meals.forEach((m) => {
        const key = toLocalDateKey(m.eaten_at);
        const day = days.find((d) => d.key === key);
        if (day) day.kcal += m.kcal;
    });

    const maxKcal = Math.max(...days.map((d) => d.kcal), GOAL);
    const chartH = 90;
    const barW = 28;
    const gap = 14;

    return (
        <View>
            <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Past 7 Days</Text>
            <View className="items-center">
                <Svg width={days.length * (barW + gap) - gap} height={chartH + 4}>
                    {days.map((bar, i) => {
                        const barH = bar.kcal > 0 ? Math.max((bar.kcal / maxKcal) * chartH, 6) : 4;
                        return (
                            <Rect
                                key={bar.key} x={i * (barW + gap)} y={chartH - barH}
                                width={barW} height={barH} rx={6}
                                fill={bar.kcal > GOAL ? "#EF4444" : "#2563EB"}
                                opacity={i === 6 ? 1 : 0.55}
                            />
                        );
                    })}
                </Svg>
                <View className="mt-1 flex-row" style={{ gap }}>
                    {days.map((d) => (
                        <Text key={d.key} style={{ width: barW, textAlign: "center" }} className="text-xs text-gray-400">{d.label}</Text>
                    ))}
                </View>
            </View>
            <View className="mt-3 flex-row items-center">
                <View className="mr-1.5 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <Text className="mr-4 text-xs text-gray-400">Under goal</Text>
                <View className="mr-1.5 h-2.5 w-2.5 rounded-full bg-red-400" />
                <Text className="text-xs text-gray-400">Over goal</Text>
            </View>
        </View>
    );
}

export default function HistoryScreen() {
    const [period, setPeriod] = useState<Period>("Day");
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMeals = async () => {
        // For week/day we fetch last 30 days; enough for all views
        const since = new Date();
        since.setDate(since.getDate() - 30);

        const { data, error } = await supabase
            .from("meals")
            .select("*")
            .gte("eaten_at", since.toISOString())
            .order("eaten_at", { ascending: false });

        if (!error && data) setMeals(data);
        setLoading(false);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchMeals();
        }, [])
    );

    const onRefresh = () => { setRefreshing(true); fetchMeals(); };

    // Group meals by local date
    const grouped: DayGroup[] = [];
    meals.forEach((m) => {
        const key = toLocalDateKey(m.eaten_at);
        let group = grouped.find((g) => g.date === key);
        if (!group) {
            group = { date: key, label: formatDateLabel(key), total: 0, meals: [] };
            grouped.push(group);
        }
        group.total += m.kcal;
        group.meals.push(m);
    });

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        >
            {/* Header */}
            <View className="bg-white px-6 pb-5 pt-14">
                <Text className="text-2xl font-bold text-gray-900">History</Text>
                <Text className="mt-1 text-sm text-gray-400">Track your meals over time</Text>
            </View>

            {/* Period Toggle */}
            <View className="mx-4 mt-4 flex-row overflow-hidden rounded-2xl bg-white p-1.5" style={{ elevation: 2 }}>
                {(["Day", "Week", "Month"] as Period[]).map((p) => (
                    <TouchableOpacity
                        key={p} onPress={() => setPeriod(p)}
                        className={`flex-1 items-center rounded-xl py-2.5 ${period === p ? "bg-blue-600" : ""}`}
                    >
                        <Text className={`text-sm font-semibold ${period === p ? "text-white" : "text-gray-400"}`}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="mt-16 items-center"><ActivityIndicator size="large" color="#2563EB" /></View>
            ) : (
                <>
                    {/* Weekly Chart */}
                    {period === "Week" && (
                        <View className="mx-4 mt-4 rounded-3xl bg-white p-5" style={{ elevation: 2 }}>
                            <WeeklyChart meals={meals} />
                        </View>
                    )}

                    {/* Month placeholder */}
                    {period === "Month" && (
                        <View className="mx-4 mt-4 items-center rounded-3xl bg-white p-8" style={{ elevation: 2 }}>
                            <Ionicons name="bar-chart-outline" size={40} color="#D1D5DB" />
                            <Text className="mt-3 text-sm text-gray-400">Monthly charts coming soon</Text>
                        </View>
                    )}

                    {/* Grouped Meal List */}
                    {(period === "Day" || period === "Week") && (
                        grouped.length === 0 ? (
                            <View className="mt-8 items-center">
                                <Ionicons name="restaurant-outline" size={48} color="#E5E7EB" />
                                <Text className="mt-3 text-sm text-gray-400">No meals logged yet</Text>
                                <Text className="text-xs text-gray-300">Add meals using the + button</Text>
                            </View>
                        ) : (
                            grouped.map((day) => (
                                <View key={day.date} className="mx-4 mt-4 rounded-3xl bg-white" style={{ elevation: 2 }}>
                                    <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
                                        <Text className="text-sm font-bold text-gray-800">{day.label}</Text>
                                        <View className={`rounded-full px-3 py-1 ${day.total >= GOAL ? "bg-green-100" : "bg-blue-100"}`}>
                                            <Text className={`text-xs font-bold ${day.total >= GOAL ? "text-green-700" : "text-blue-700"}`}>
                                                {day.total} / {GOAL} kcal
                                            </Text>
                                        </View>
                                    </View>
                                    {day.meals.map((meal, idx) => (
                                        <View
                                            key={meal.id}
                                            className={`flex-row items-center px-5 py-3 ${idx < day.meals.length - 1 ? "border-b border-gray-50" : ""}`}
                                        >
                                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                                                <Text className="text-xl">{mealIcon(meal.name)}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-semibold text-gray-800">{meal.name}</Text>
                                                <Text className="text-xs text-gray-400">{formatTime(meal.eaten_at)}</Text>
                                            </View>
                                            <Text className="text-sm font-bold text-gray-600">{meal.kcal} kcal</Text>
                                        </View>
                                    ))}
                                </View>
                            ))
                        )
                    )}
                </>
            )}

            <View className="h-10" />
        </ScrollView>
    );
}
