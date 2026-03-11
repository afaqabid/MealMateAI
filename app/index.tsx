import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Index() {
  const { session, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/(auth)/login");
      return;
    }

    // Check if onboarding is complete
    supabase
      .from("user_profiles")
      .select("setup_complete")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.setup_complete) {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/onboarding");
        }
        setChecking(false);
      });
  }, [session, loading]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
