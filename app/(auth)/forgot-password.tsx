import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        // TODO: Wire up password reset logic
        setSent(true);
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Back button */}
                <TouchableOpacity
                    className="mt-14 self-start px-6 py-2"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                {/* Header */}
                <View className="items-center px-6 pb-8 pt-4">
                    <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                        <Ionicons name="lock-open-outline" size={32} color="#F97316" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">
                        Forgot password?
                    </Text>
                    <Text className="mt-2 text-center text-sm text-gray-400">
                        No worries! Enter your email and we'll{"\n"}send you a reset link.
                    </Text>
                </View>

                <View className="flex-1 px-6">
                    {!sent ? (
                        <>
                            {/* Email input */}
                            <Text className="mb-1.5 text-sm font-medium text-gray-700">
                                Email address
                            </Text>
                            <View className="mb-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                                <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                                <TextInput
                                    className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                    placeholder="you@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            {/* Send button */}
                            <TouchableOpacity
                                className="items-center rounded-xl bg-orange-500 py-4"
                                onPress={handleSend}
                                activeOpacity={0.85}
                            >
                                <Text className="text-base font-semibold text-white">
                                    Send Reset Link
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* Success state */
                        <View className="items-center rounded-2xl bg-green-50 px-6 py-8">
                            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={32}
                                    color="#16A34A"
                                />
                            </View>
                            <Text className="text-lg font-semibold text-gray-800">
                                Check your inbox!
                            </Text>
                            <Text className="mt-1 text-center text-sm text-gray-500">
                                We sent a reset link to{"\n"}
                                <Text className="font-medium text-gray-800">{email}</Text>
                            </Text>

                            <TouchableOpacity
                                className="mt-6 items-center rounded-xl bg-green-600 px-8 py-3.5"
                                onPress={() => router.replace("/(auth)/login")}
                                activeOpacity={0.85}
                            >
                                <Text className="text-sm font-semibold text-white">
                                    Back to Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Back to login */}
                    {!sent && (
                        <TouchableOpacity
                            className="mt-6 flex-row items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={14} color="#6B7280" />
                            <Text className="ml-1 text-sm text-gray-500">
                                Back to{" "}
                                <Text className="font-semibold text-blue-600">Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
