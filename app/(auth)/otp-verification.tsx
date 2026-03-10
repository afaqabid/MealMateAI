import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;

export default function OtpVerificationScreen() {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (timer === 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-advance to next box
        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        // TODO: Wire up resend OTP logic
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimer(59);
        setCanResend(false);
        inputs.current[0]?.focus();
    };

    const handleVerify = () => {
        // TODO: Wire up OTP verification logic
        router.replace("/(tabs)/dashboard");
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
                    <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                        <Ionicons name="shield-checkmark-outline" size={32} color="#2563EB" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">
                        Verify your email
                    </Text>
                    <Text className="mt-2 text-center text-sm text-gray-400">
                        We sent a 6-digit code to your email.{"\n"}Enter it below to confirm
                        your account.
                    </Text>
                </View>

                <View className="flex-1 px-6">
                    {/* OTP Boxes */}
                    <View className="mb-8 flex-row justify-between">
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputs.current[index] = ref;
                                }}
                                className={`h-14 w-12 rounded-xl border bg-gray-50 text-center text-xl font-bold text-gray-900 ${otp[index]
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200"
                                    }`}
                                maxLength={1}
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
                        className={`items-center rounded-xl py-4 ${isComplete ? "bg-blue-600" : "bg-gray-200"
                            }`}
                        onPress={handleVerify}
                        disabled={!isComplete}
                        activeOpacity={0.85}
                    >
                        <Text
                            className={`text-base font-semibold ${isComplete ? "text-white" : "text-gray-400"
                                }`}
                        >
                            Verify Account
                        </Text>
                    </TouchableOpacity>

                    {/* Resend */}
                    <View className="mt-6 flex-row items-center justify-center">
                        <Text className="text-sm text-gray-500">
                            Didn't receive the code?{" "}
                        </Text>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend}>
                                <Text className="text-sm font-semibold text-blue-600">
                                    Resend
                                </Text>
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
