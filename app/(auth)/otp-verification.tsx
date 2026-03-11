import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { pendingEmail } from "./register";

const OTP_LENGTH = 6;

export default function OtpVerificationScreen() {
    const { verifyOtp } = useAuth();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (timer === 0) { setCanResend(true); return; }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (val: string, index: number) => {
        // Paste: distribute all digits across boxes from current index
        if (val.length > 1) {
            const digits = val.replace(/\D/g, "").slice(0, OTP_LENGTH);
            const newOtp = [...otp];
            digits.split("").forEach((char, i) => {
                if (index + i < OTP_LENGTH) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            const nextFocus = Math.min(index + digits.length, OTP_LENGTH - 1);
            inputs.current[nextFocus]?.focus();
            return;
        }
        // Normal single-digit typing
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (val && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimer(59);
        setCanResend(false);
        setError(null);
        inputs.current[0]?.focus();
        // TODO: call supabase.auth.resend({ type: 'signup', email: pendingEmail })
    };

    const handleVerify = async () => {
        const token = otp.join("");
        setError(null);
        setLoading(true);
        const err = await verifyOtp(pendingEmail, token);
        setLoading(false);
        if (err) {
            setError(err);
        } else {
            router.replace("/(tabs)/dashboard");
        }
    };

    const isComplete = otp.every((d) => d !== "");

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
                        Verify your email
                    </Text>
                    <Text className="mt-2 text-center text-sm text-gray-400">
                        We sent a 6-digit code to{"\n"}
                        <Text className="font-medium text-gray-700">{pendingEmail}</Text>
                    </Text>
                </View>

                <View className="flex-1 px-6">
                    {/* Error banner */}
                    {error && (
                        <View className="mb-4 flex-row items-center rounded-xl bg-red-50 px-4 py-3">
                            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                            <Text className="ml-2 flex-1 text-sm text-red-600">{error}</Text>
                        </View>
                    )}

                    {/* OTP Boxes */}
                    <View className="mb-8 flex-row justify-between">
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputs.current[index] = ref; }}
                                className={`h-14 w-12 rounded-xl border bg-gray-50 text-center text-xl font-bold text-gray-900 ${otp[index] ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                    }`}
                                maxLength={OTP_LENGTH}
                                keyboardType="number-pad"
                                value={otp[index]}
                                onChangeText={(val) => handleChange(val, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                selectionColor="#2563EB"
                            />
                        ))}
                    </View>

                    {/* Verify button */}
                    <TouchableOpacity
                        className={`items-center rounded-xl py-4 ${isComplete && !loading ? "bg-blue-600" : "bg-gray-200"
                            }`}
                        onPress={handleVerify}
                        disabled={!isComplete || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className={`text-base font-semibold ${isComplete ? "text-white" : "text-gray-400"}`}>
                                Verify Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend */}
                    <View className="mt-6 flex-row items-center justify-center">
                        <Text className="text-sm text-gray-500">Didn't receive the code? </Text>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend}>
                                <Text className="text-sm font-semibold text-blue-600">Resend</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-sm font-medium text-gray-400">
                                Resend in 0:{String(timer).padStart(2, "0")}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
