import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    Text, TextInput, TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const TOTAL_STEPS = 6;

// ── Conversions ──────────────────────────────────────────────
function kgToLbs(kg: number) { return +(kg * 2.20462).toFixed(1); }
function lbsToKg(lbs: number) { return +(lbs / 2.20462).toFixed(1); }
function cmToFtIn(cm: number) { const totalIn = cm / 2.54; const ft = Math.floor(totalIn / 12); const inches = +(totalIn % 12).toFixed(1); return { ft, inches }; }
function cmToIn(cm: number) { return +(cm / 2.54).toFixed(1); }
function ftInToCm(ft: number, inches: number) { return +((ft * 12 + inches) * 2.54).toFixed(1); }
function inToCm(inches: number) { return +(inches * 2.54).toFixed(1); }

function calcBMI(weightKg: number, heightCm: number) {
    if (!weightKg || !heightCm) return 0;
    return +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
}
function bmiLabel(bmi: number) {
    if (bmi < 18.5) return { label: "Underweight", color: "#F59E0B" };
    if (bmi < 25) return { label: "Normal", color: "#10B981" };
    if (bmi < 30) return { label: "Overweight", color: "#F97316" };
    return { label: "Obese", color: "#EF4444" };
}
function calcBMR(weightKg: number, heightCm: number, age: number, gender: string) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === "Male") return Math.round(base + 5);
    if (gender === "Female") return Math.round(base - 161);
    return Math.round(base - 78); // Other/average
}
function goalColor(val: number) {
    if (val < 1200 || val > 4000) return "#EF4444";
    if (val < 1500 || val > 3500) return "#F97316";
    return "#10B981";
}
function goalHint(val: number) {
    if (val < 1200) return "⚠️ Too low — may be unsafe";
    if (val > 4000) return "⚠️ Too high — consult a professional";
    if (val < 1500) return "⚡ Slightly low — suitable for light cut";
    if (val > 3500) return "🔥 High — good for muscle gain";
    return "✅ Looks great!";
}

// ── Progress Bar ───────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
    return (
        <View className="flex-row gap-1.5 px-6 pt-12">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ backgroundColor: i <= step ? "#2563EB" : "#E5E7EB" }}
                />
            ))}
        </View>
    );
}

// ── Gender Card ────────────────────────────────────────────────
function GenderCard({ label, icon, selected, onPress }: { label: string; icon: string; selected: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 items-center rounded-2xl border-2 py-5 ${selected ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}
        >
            <Text className="mb-2 text-3xl">{icon}</Text>
            <Text className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-gray-500"}`}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function OnboardingScreen() {
    const { user } = useAuth();
    const { width: W } = useWindowDimensions();
    const [step, setStep] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [weightVal, setWeightVal] = useState("");
    const [heightUnit, setHeightUnit] = useState<"cm" | "ft+in" | "inches">("cm");
    const [heightCm, setHeightCm] = useState("");
    const [heightFt, setHeightFt] = useState("");
    const [heightIn, setHeightIn] = useState("");
    const [heightInches, setHeightInches] = useState("");
    const [dailyGoal, setDailyGoal] = useState("2000");

    // Derived values
    const weightKg = weightUnit === "kg" ? parseFloat(weightVal) : lbsToKg(parseFloat(weightVal));
    const resolvedHeightCm =
        heightUnit === "cm" ? parseFloat(heightCm) :
            heightUnit === "ft+in" ? ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0) :
                inToCm(parseFloat(heightInches));
    const bmi = calcBMI(weightKg, resolvedHeightCm);
    const bmr = calcBMR(weightKg, resolvedHeightCm, parseInt(age), gender);
    const goalVal = parseInt(dailyGoal) || 0;

    const goNext = () => {
        if (step >= TOTAL_STEPS - 1) return;
        const next = step + 1;
        scrollRef.current?.scrollTo({ x: next * W, animated: true });
        setStep(next);
    };
    const goBack = () => {
        if (step <= 0) return;
        const prev = step - 1;
        scrollRef.current?.scrollTo({ x: prev * W, animated: true });
        setStep(prev);
    };

    const canContinue = () => {
        if (step === 0) return name.trim().length > 0;
        if (step === 1) return parseInt(age) > 0 && parseInt(age) < 120;
        if (step === 2) return parseFloat(weightVal) > 0;
        if (step === 3) {
            if (heightUnit === "cm") return parseFloat(heightCm) > 0;
            if (heightUnit === "ft+in") return parseFloat(heightFt) > 0;
            return parseFloat(heightInches) > 0;
        }
        if (step === 4) return goalVal >= 800 && goalVal <= 5000;
        return true;
    };

    const handleFinish = async () => {
        setSaving(true);
        const { error } = await supabase.from("user_profiles").upsert({
            id: user!.id,
            weight: weightKg,
            height: resolvedHeightCm,
            daily_goal: goalVal,
            unit: weightUnit,
            age: parseInt(age),
            gender,
            setup_complete: true,
            updated_at: new Date().toISOString(),
        });
        setSaving(false);
        if (error) { Alert.alert("Error", error.message); return; }
        router.replace("/(tabs)/dashboard");
    };

    // ── Weight hint ──────────────────────────────────────────────
    const weightHint = () => {
        const v = parseFloat(weightVal);
        if (!v) return null;
        return weightUnit === "kg"
            ? `≈ ${kgToLbs(v)} lbs`
            : `≈ ${lbsToKg(v)} kg`;
    };

    // ── Height hints ─────────────────────────────────────────────
    const heightHint = () => {
        if (!resolvedHeightCm) return null;
        if (heightUnit === "cm") {
            const { ft, inches } = cmToFtIn(resolvedHeightCm);
            return `≈ ${ft}′ ${inches}″  |  ${cmToIn(resolvedHeightCm)} inches`;
        }
        if (heightUnit === "ft+in") return `≈ ${resolvedHeightCm.toFixed(1)} cm  |  ${cmToIn(resolvedHeightCm)} inches`;
        return `≈ ${resolvedHeightCm.toFixed(1)} cm  |  ${cmToFtIn(resolvedHeightCm).ft}′ ${cmToFtIn(resolvedHeightCm).inches}″`;
    };

    const slides = [
        // ── Step 0: Name ──────────────────────────────────────────
        <View key="name" style={{ width: W }} className="flex-1 px-6 pt-8">
            <Text className="mb-2 text-3xl font-bold text-gray-900">What's your name?</Text>
            <Text className="mb-8 text-base text-gray-400">We'll personalise your experience.</Text>
            <TextInput
                className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg font-semibold text-gray-900"
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoFocus
                style={{ elevation: 2 }}
            />
        </View>,

        // ── Step 1: Age + Gender ──────────────────────────────────
        <View key="age" style={{ width: W }} className="flex-1 px-6 pt-8">
            <Text className="mb-2 text-3xl font-bold text-gray-900">About you</Text>
            <Text className="mb-6 text-base text-gray-400">Helps us calculate your metabolism.</Text>
            <Text className="mb-2 text-sm font-semibold text-gray-600">Age</Text>
            <TextInput
                className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg font-semibold text-gray-900"
                placeholder="e.g. 25"
                placeholderTextColor="#9CA3AF"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                style={{ elevation: 2 }}
            />
            <Text className="mb-3 text-sm font-semibold text-gray-600">Gender</Text>
            <View className="flex-row gap-3">
                <GenderCard label="Male" icon="👨" selected={gender === "Male"} onPress={() => setGender("Male")} />
                <GenderCard label="Female" icon="👩" selected={gender === "Female"} onPress={() => setGender("Female")} />
                <GenderCard label="Other" icon="🧑" selected={gender === "Other"} onPress={() => setGender("Other")} />
            </View>
        </View>,

        // ── Step 2: Weight ────────────────────────────────────────
        <View key="weight" style={{ width: W }} className="flex-1 px-6 pt-8">
            <Text className="mb-2 text-3xl font-bold text-gray-900">Your weight</Text>
            <Text className="mb-6 text-base text-gray-400">We'll use this to calculate your BMI.</Text>
            {/* Unit Toggle */}
            <View className="mb-5 flex-row overflow-hidden rounded-2xl bg-gray-100 p-1">
                {(["kg", "lbs"] as const).map((u) => (
                    <TouchableOpacity key={u} onPress={() => setWeightUnit(u)} className={`flex-1 items-center rounded-xl py-2.5 ${weightUnit === u ? "bg-white" : ""}`} style={weightUnit === u ? { elevation: 2 } : {}}>
                        <Text className={`text-sm font-bold ${weightUnit === u ? "text-blue-600" : "text-gray-400"}`}>{u}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-5" style={{ elevation: 2 }}>
                <TextInput
                    className="flex-1 py-4 text-2xl font-bold text-gray-900"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    value={weightVal}
                    onChangeText={setWeightVal}
                    keyboardType="decimal-pad"
                />
                <Text className="ml-2 text-lg font-semibold text-gray-400">{weightUnit}</Text>
            </View>
            {weightHint() && (
                <Text className="mt-2 pl-1 text-sm text-gray-400">{weightHint()}</Text>
            )}
        </View>,

        // ── Step 3: Height ────────────────────────────────────────
        <View key="height" style={{ width: W }} className="flex-1 px-6 pt-8">
            <Text className="mb-2 text-3xl font-bold text-gray-900">Your height</Text>
            <Text className="mb-6 text-base text-gray-400">Used with your weight for BMI.</Text>
            {/* Unit Toggle */}
            <View className="mb-5 flex-row overflow-hidden rounded-2xl bg-gray-100 p-1">
                {(["cm", "ft+in", "inches"] as const).map((u) => (
                    <TouchableOpacity key={u} onPress={() => setHeightUnit(u)} className={`flex-1 items-center rounded-xl py-2 ${heightUnit === u ? "bg-white" : ""}`} style={heightUnit === u ? { elevation: 2 } : {}}>
                        <Text className={`text-xs font-bold ${heightUnit === u ? "text-blue-600" : "text-gray-400"}`}>{u}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {heightUnit === "cm" && (
                <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-5" style={{ elevation: 2 }}>
                    <TextInput className="flex-1 py-4 text-2xl font-bold text-gray-900" placeholder="170" placeholderTextColor="#D1D5DB" value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" />
                    <Text className="ml-2 text-lg font-semibold text-gray-400">cm</Text>
                </View>
            )}
            {heightUnit === "ft+in" && (
                <View className="flex-row gap-3">
                    <View className="flex-1 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4" style={{ elevation: 2 }}>
                        <TextInput className="flex-1 py-4 text-2xl font-bold text-gray-900" placeholder="5" placeholderTextColor="#D1D5DB" value={heightFt} onChangeText={setHeightFt} keyboardType="number-pad" />
                        <Text className="ml-1 text-lg font-semibold text-gray-400">ft</Text>
                    </View>
                    <View className="flex-1 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4" style={{ elevation: 2 }}>
                        <TextInput className="flex-1 py-4 text-2xl font-bold text-gray-900" placeholder="9" placeholderTextColor="#D1D5DB" value={heightIn} onChangeText={setHeightIn} keyboardType="decimal-pad" />
                        <Text className="ml-1 text-lg font-semibold text-gray-400">in</Text>
                    </View>
                </View>
            )}
            {heightUnit === "inches" && (
                <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-5" style={{ elevation: 2 }}>
                    <TextInput className="flex-1 py-4 text-2xl font-bold text-gray-900" placeholder="69" placeholderTextColor="#D1D5DB" value={heightInches} onChangeText={setHeightInches} keyboardType="decimal-pad" />
                    <Text className="ml-2 text-lg font-semibold text-gray-400">in</Text>
                </View>
            )}
            {heightHint() && (
                <Text className="mt-2 pl-1 text-sm text-gray-400">{heightHint()}</Text>
            )}
        </View>,

        // ── Step 4: BMI / BMR + Goal ──────────────────────────────
        <ScrollView key="goal" style={{ width: W }} className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}>
            <Text className="mb-2 text-3xl font-bold text-gray-900">Your numbers</Text>
            <Text className="mb-6 text-base text-gray-400">Based on what you told us.</Text>
            {/* BMI */}
            {bmi > 0 && (
                <View className="mb-4 flex-row overflow-hidden rounded-2xl bg-white" style={{ elevation: 2 }}>
                    <View className="flex-1 items-center border-r border-gray-100 p-4">
                        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">BMI</Text>
                        <Text className="mt-1 text-3xl font-bold text-gray-900">{bmi}</Text>
                        <Text className="mt-0.5 text-xs font-bold" style={{ color: bmiLabel(bmi).color }}>{bmiLabel(bmi).label}</Text>
                    </View>
                    <View className="flex-1 items-center p-4">
                        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">BMR</Text>
                        <Text className="mt-1 text-3xl font-bold text-gray-900">{bmr}</Text>
                        <Text className="mt-0.5 text-xs text-gray-400">kcal / day</Text>
                    </View>
                </View>
            )}
            <Text className="mb-2 text-sm font-semibold text-gray-600">Daily Calorie Goal</Text>
            <Text className="mb-3 text-xs text-gray-400">Your BMR is {bmr} kcal. Set a goal based on your target.</Text>
            <View
                className="flex-row items-center rounded-2xl border-2 bg-white px-5"
                style={{ elevation: 2, borderColor: goalVal > 0 ? goalColor(goalVal) : "#E5E7EB" }}
            >
                <TextInput
                    className="flex-1 py-4 text-2xl font-bold text-gray-900"
                    placeholder="2000"
                    placeholderTextColor="#D1D5DB"
                    value={dailyGoal}
                    onChangeText={setDailyGoal}
                    keyboardType="number-pad"
                />
                <Text className="ml-2 text-lg font-semibold text-gray-400">kcal</Text>
            </View>
            {goalVal > 0 && (
                <Text className="mt-2 pl-1 text-sm font-medium" style={{ color: goalColor(goalVal) }}>{goalHint(goalVal)}</Text>
            )}
            <View className="h-6" />
        </ScrollView>,

        // ── Step 5: Summary ───────────────────────────────────────
        <View key="summary" style={{ width: W }} className="flex-1 px-6 pt-8">
            <Text className="mb-2 text-3xl font-bold text-gray-900">Looking good, {name.split(" ")[0]}! 🎉</Text>
            <Text className="mb-8 text-base text-gray-400">Here's a summary of your profile.</Text>
            {[
                { label: "Age", val: `${age} yrs` },
                { label: "Gender", val: gender },
                { label: "Weight", val: `${weightKg.toFixed(1)} kg` },
                { label: "Height", val: `${resolvedHeightCm.toFixed(1)} cm` },
                { label: "BMI", val: `${bmi} — ${bmiLabel(bmi).label}` },
                { label: "BMR", val: `${bmr} kcal/day` },
                { label: "Daily Goal", val: `${dailyGoal} kcal` },
            ].map(({ label, val }) => (
                <View key={label} className="flex-row justify-between border-b border-gray-100 py-3">
                    <Text className="text-sm text-gray-500">{label}</Text>
                    <Text className="text-sm font-bold text-gray-900">{val}</Text>
                </View>
            ))}
        </View>,
    ];

    return (
        <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            {/* Progress */}
            <ProgressBar step={step} />

            {/* Slides */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                className="flex-1"
            >
                {slides}
            </ScrollView>

            {/* Bottom Buttons */}
            <View className="flex-row gap-3 px-6 pb-10 pt-4">
                {step > 0 && (
                    <TouchableOpacity
                        onPress={goBack}
                        className="h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white"
                        style={{ elevation: 2 }}
                    >
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </TouchableOpacity>
                )}
                {step < TOTAL_STEPS - 1 ? (
                    <TouchableOpacity
                        onPress={goNext}
                        disabled={!canContinue()}
                        className={`flex-1 items-center justify-center rounded-2xl py-4 ${canContinue() ? "bg-blue-600" : "bg-gray-200"}`}
                        style={{ elevation: canContinue() ? 4 : 0 }}
                    >
                        <Text className={`text-base font-bold ${canContinue() ? "text-white" : "text-gray-400"}`}>Continue</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleFinish}
                        disabled={saving}
                        className="flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4"
                        style={{ elevation: 4 }}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-base font-bold text-white">🚀 Let's Get Started!</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
