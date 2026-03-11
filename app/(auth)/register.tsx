import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// Store email globally so OTP screen can read it
export let pendingEmail = "";

export default function RegisterScreen() {
    const { signUp } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setError(null);
        setLoading(true);
        const err = await signUp(email, password, name);
        setLoading(false);
        if (err) {
            setError(err);
        } else {
            pendingEmail = email;
            router.push("/(auth)/otp-verification");
        }
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
                {/* Header */}
                <View className="items-center px-6 pb-6 pt-16">
                    <View className="mb-5 items-center justify-center">
                        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-blue-600" style={{ elevation: 6 }}>
                            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-500">
                                <Text style={{ fontSize: 32 }}>🍽️</Text>
                            </View>
                        </View>
                        <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-white">
                            <Text style={{ fontSize: 12 }}>✨</Text>
                        </View>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">
                        Create account ✨
                    </Text>
                    <Text className="mt-2 text-center text-sm text-gray-400">
                        Start your personalised meal journey
                    </Text>
                </View>

                {/* Form */}
                <View className="flex-1 px-6">
                    {/* Error banner */}
                    {error && (
                        <View className="mb-4 flex-row items-center rounded-xl bg-red-50 px-4 py-3">
                            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                            <Text className="ml-2 flex-1 text-sm text-red-600">{error}</Text>
                        </View>
                    )}

                    {/* Full name */}
                    <View className="mb-4">
                        <Text className="mb-1.5 text-sm font-medium text-gray-700">
                            Full name
                        </Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                            <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                placeholder="John Doe"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="mb-1.5 text-sm font-medium text-gray-700">
                            Email address
                        </Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
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
                    </View>

                    {/* Password */}
                    <View className="mb-4">
                        <Text className="mb-1.5 text-sm font-medium text-gray-700">
                            Password
                        </Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                placeholder="Min. 8 characters"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View className="mb-6">
                        <Text className="mb-1.5 text-sm font-medium text-gray-700">
                            Confirm password
                        </Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                placeholder="Re-enter your password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showConfirm}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons
                                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Terms note */}
                    <Text className="mb-5 text-center text-xs text-gray-400">
                        By signing up you agree to our{" "}
                        <Text className="font-medium text-blue-600">Terms of Service</Text>{" "}
                        and{" "}
                        <Text className="font-medium text-blue-600">Privacy Policy</Text>.
                    </Text>

                    {/* Register button */}
                    <TouchableOpacity
                        className={`items-center rounded-xl py-4 ${loading ? "bg-blue-400" : "bg-blue-600"}`}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-base font-semibold text-white">
                                Create Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign in link */}
                    <View className="mt-6 flex-row items-center justify-center">
                        <Text className="text-sm text-gray-500">
                            Already have an account?{" "}
                        </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-sm font-semibold text-blue-600">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
