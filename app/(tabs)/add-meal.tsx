import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { estimateByPhoto, estimateByText, MealEstimation } from "../../lib/gemini";
import { supabase } from "../../lib/supabase";

type Mode = "text" | "photo";


export default function AddMealScreen() {
    const { user } = useAuth();
    const [mode, setMode] = useState<Mode>("text");
    const [mealName, setMealName] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [estimating, setEstimating] = useState(false);
    const [result, setResult] = useState<MealEstimation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [added, setAdded] = useState(false);

    const handleEstimateText = async () => {
        if (!mealName.trim()) return;
        setEstimating(true);
        setResult(null);
        setError(null);
        try {
            const estimation = await estimateByText(mealName);
            setResult(estimation);
        } catch (e: any) {
            console.error("[Gemini] Text estimation error:", e);
            setError(e?.message ?? "AI estimation failed. Please try again.");
        } finally {
            setEstimating(false);
        }
    };

    const handlePickImage = async (fromCamera: boolean) => {
        const fn = fromCamera
            ? ImagePicker.launchCameraAsync
            : ImagePicker.launchImageLibraryAsync;
        const res = await fn({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!res.canceled) {
            setImage(res.assets[0].uri);
            setResult(null);
            setError(null);
            setAdded(false);
        }
    };

    const handleEstimatePhoto = async () => {
        if (!image) return;
        setEstimating(true);
        setResult(null);
        setError(null);
        try {
            // Read image as base64 for Gemini Vision
            const base64 = await FileSystem.readAsStringAsync(image, {
                encoding: "base64",
            });
            const estimation = await estimateByPhoto(base64);
            setResult(estimation);
        } catch (e: any) {
            console.error("[Gemini] Photo estimation error:", e);
            setError(e?.message ?? "Could not estimate from photo. Please try again.");
        } finally {
            setEstimating(false);
        }
    };

    const handleAdd = async () => {
        if (!result) return;
        setError(null);
        try {
            const { error: insertError } = await supabase.from("meals").insert({
                user_id: user?.id,
                name: result.name,
                kcal: result.kcal,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
            });
            if (insertError) throw insertError;
            setAdded(true);
            setTimeout(() => {
                setMealName("");
                setImage(null);
                setResult(null);
                setAdded(false);
            }, 1500);
        } catch (e: any) {
            console.error("[Supabase] Insert error:", e);
            setError(e?.message ?? "Failed to save meal. Please try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View className="bg-white px-6 pb-5 pt-14">
                    <Text className="text-2xl font-bold text-gray-900">Add Meal</Text>
                    <Text className="mt-1 text-sm text-gray-400">
                        Type a meal name or snap a photo — AI will estimate the calories.
                    </Text>
                </View>

                {/* Mode Toggle */}
                <View className="mx-4 mt-4 flex-row overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm" style={{ elevation: 2 }}>
                    {(["text", "photo"] as Mode[]).map((m) => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => { setMode(m); setResult(null); setImage(null); }}
                            className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${mode === m ? "bg-blue-600" : ""
                                }`}
                        >
                            <Ionicons
                                name={m === "text" ? "create-outline" : "camera-outline"}
                                size={16}
                                color={mode === m ? "#fff" : "#9CA3AF"}
                            />
                            <Text
                                className={`ml-2 text-sm font-semibold ${mode === m ? "text-white" : "text-gray-400"
                                    }`}
                            >
                                {m === "text" ? "Type Meal" : "Photo"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mx-4 mt-4">
                    {/* Error banner */}
                    {error && (
                        <View className="mb-3 flex-row items-center rounded-2xl bg-red-50 px-4 py-3">
                            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                            <Text className="ml-2 flex-1 text-sm text-red-600">{error}</Text>
                        </View>
                    )}

                    {/* ---- TEXT MODE ---- */}
                    {mode === "text" && (
                        <View className="rounded-3xl bg-white p-5 shadow-sm" style={{ elevation: 2 }}>
                            <Text className="mb-2 text-sm font-medium text-gray-700">
                                What did you eat?
                            </Text>
                            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                                <Ionicons name="restaurant-outline" size={18} color="#9CA3AF" />
                                <TextInput
                                    className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                    placeholder="e.g. Grilled Chicken Salad"
                                    placeholderTextColor="#9CA3AF"
                                    value={mealName}
                                    onChangeText={(t) => { setMealName(t); setResult(null); }}
                                    onSubmitEditing={handleEstimateText}
                                    returnKeyType="search"
                                />
                            </View>
                            <TouchableOpacity
                                className={`mt-4 flex-row items-center justify-center rounded-xl py-3.5 ${mealName.trim() ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                                onPress={handleEstimateText}
                                disabled={!mealName.trim() || estimating}
                            >
                                {estimating ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles" size={16} color={mealName.trim() ? "#fff" : "#9CA3AF"} />
                                        <Text className={`ml-2 text-sm font-semibold ${mealName.trim() ? "text-white" : "text-gray-400"}`}>
                                            Estimate with AI
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ---- PHOTO MODE ---- */}
                    {mode === "photo" && (
                        <View className="rounded-3xl bg-white p-5 shadow-sm" style={{ elevation: 2 }}>
                            {!image ? (
                                <View className="items-center">
                                    <View className="mb-4 h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                                        <Ionicons name="image-outline" size={48} color="#D1D5DB" />
                                        <Text className="mt-2 text-sm text-gray-400">No photo selected</Text>
                                    </View>
                                    <View className="w-full flex-row gap-3">
                                        <TouchableOpacity
                                            className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3.5"
                                            onPress={() => handlePickImage(true)}
                                        >
                                            <Ionicons name="camera-outline" size={18} color="#fff" />
                                            <Text className="ml-2 text-sm font-semibold text-white">Camera</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3.5"
                                            onPress={() => handlePickImage(false)}
                                        >
                                            <Ionicons name="images-outline" size={18} color="#374151" />
                                            <Text className="ml-2 text-sm font-semibold text-gray-700">Gallery</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Image
                                        source={{ uri: image }}
                                        className="mb-4 h-52 w-full rounded-2xl"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            className="flex-row items-center rounded-xl border border-gray-200 px-4 py-3"
                                            onPress={() => { setImage(null); setResult(null); }}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
                                            onPress={handleEstimatePhoto}
                                            disabled={estimating}
                                        >
                                            {estimating ? (
                                                <ActivityIndicator color="#fff" size="small" />
                                            ) : (
                                                <>
                                                    <Ionicons name="sparkles" size={16} color="#fff" />
                                                    <Text className="ml-2 text-sm font-semibold text-white">Estimate with AI</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ---- ESTIMATION RESULT ---- */}
                    {result && (
                        <View className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm" style={{ elevation: 2 }}>
                            <View className="bg-blue-600 px-5 py-4">
                                <Text className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                                    AI Estimation
                                </Text>
                                <Text className="mt-1 text-xl font-bold text-white">{result.name}</Text>
                            </View>
                            <View className="px-5 py-4">
                                <View className="mb-4 items-center">
                                    <Text className="text-4xl font-bold text-gray-900">{result.kcal}</Text>
                                    <Text className="text-sm text-gray-400">kcal</Text>
                                </View>
                                <View className="flex-row justify-around">
                                    {[
                                        { label: "Protein", val: `${result.protein}g`, color: "text-blue-600" },
                                        { label: "Carbs", val: `${result.carbs}g`, color: "text-amber-600" },
                                        { label: "Fat", val: `${result.fat}g`, color: "text-rose-500" },
                                    ].map((m) => (
                                        <View key={m.label} className="items-center">
                                            <Text className={`text-base font-bold ${m.color}`}>{m.val}</Text>
                                            <Text className="text-xs text-gray-400">{m.label}</Text>
                                        </View>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    className={`mt-4 items-center rounded-xl py-4 ${added ? "bg-green-500" : "bg-blue-600"}`}
                                    onPress={handleAdd}
                                    disabled={added}
                                >
                                    {added ? (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                            <Text className="ml-2 text-sm font-semibold text-white">Added!</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-sm font-semibold text-white">+ Add to Today</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <View className="h-10" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
