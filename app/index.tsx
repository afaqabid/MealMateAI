import { Redirect } from "expo-router";

// Entry point — redirect to login.
// Once auth is implemented, swap to "/(tabs)/dashboard" for logged-in users.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}

