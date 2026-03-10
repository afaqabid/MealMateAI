import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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
import Svg, { Path } from "react-native-svg";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // TODO: Wire up auth logic
        router.replace("/(tabs)/dashboard");
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
                <View className="items-center px-6 pb-6 pt-20">
                    {/* Logo mark */}
                    <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                        <Ionicons name="nutrition" size={34} color="#fff" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">
                        Welcome back 👋
                    </Text>
                    <Text className="mt-2 text-center text-sm text-gray-400">
                        Sign in to continue to MealMateAI
                    </Text>
                </View>

                {/* Form */}
                <View className="flex-1 px-6">
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
                    <View className="mb-2">
                        <Text className="mb-1.5 text-sm font-medium text-gray-700">
                            Password
                        </Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                className="ml-3 flex-1 py-3.5 text-sm text-gray-900"
                                placeholder="Enter your password"
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

                    {/* Forgot password */}
                    <TouchableOpacity
                        className="mb-6 self-end"
                        onPress={() => router.push("/(auth)/forgot-password")}
                    >
                        <Text className="text-sm font-medium text-blue-600">
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

                    {/* Login button */}
                    <TouchableOpacity
                        className="items-center rounded-xl bg-blue-600 py-4"
                        onPress={handleLogin}
                        activeOpacity={0.85}
                    >
                        <Text className="text-base font-semibold text-white">Sign In</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="my-6 flex-row items-center">
                        <View className="h-px flex-1 bg-gray-200" />
                        <Text className="mx-4 text-sm text-gray-400">or</Text>
                        <View className="h-px flex-1 bg-gray-200" />
                    </View>

                    {/* Google */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3.5"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.06,
                            shadowRadius: 2,
                            elevation: 1,
                        }}
                    >
                        {/* Official Google G SVG */}
                        <Svg width={20} height={20} viewBox="0 0 48 48">
                            <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </Svg>
                        <Text className="ml-3 text-sm font-medium text-gray-700">
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    {/* Sign up link */}
                    <View className="mt-8 flex-row items-center justify-center">
                        <Text className="text-sm text-gray-500">
                            Don't have an account?{" "}
                        </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text className="text-sm font-semibold text-blue-600">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
