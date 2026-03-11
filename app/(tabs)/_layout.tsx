import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopColor: "#F1F5F9",
                    paddingBottom: 6,
                    height: 62,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add-meal"
                options={{
                    title: "Add Meal",
                    tabBarIcon: ({ focused }) => (
                        <View
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 23,
                                backgroundColor: "#2563EB",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 20,
                                shadowColor: "#2563EB",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.35,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            <Ionicons name="add" size={26} color="#fff" />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
