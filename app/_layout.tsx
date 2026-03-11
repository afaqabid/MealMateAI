import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

// Keep the native splash visible while JS bundle loads
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Hide the native splash as soon as the component mounts (JS is ready)
    // Our animated splash takes over from here
    SplashScreen.hideAsync();
    setAppReady(true);
  }, []);

  // Show nothing until JS is ready
  if (!appReady) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      </Stack>

      {/* Animated splash overlays everything until done */}
      {!splashDone && (
        <AnimatedSplash onFinished={() => setSplashDone(true)} />
      )}
    </AuthProvider>
  );
}
