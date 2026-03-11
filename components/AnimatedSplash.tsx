import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface Props {
    onFinished: () => void;
}

export function AnimatedSplash({ onFinished }: Props) {
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            // 1. Logo pops in
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            // 2. App name fades in
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 350,
                delay: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            // 3. Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            // 4. Hold for a moment
            Animated.delay(600),
            // 5. Whole screen fades out
            Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 400,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => onFinished());
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
            {/* Logo circle */}
            <Animated.View
                style={[
                    styles.logoWrapper,
                    { opacity: logoOpacity, transform: [{ scale: logoScale }] },
                ]}
            >
                <View style={styles.logoOuter}>
                    <View style={styles.logoInner}>
                        {/* Fork + spoon icon using Views */}
                        <Animated.Text style={styles.logoEmoji}>🍽️</Animated.Text>
                    </View>
                </View>
                {/* Sparkle accents */}
                <Animated.Text style={[styles.sparkle, { top: -4, right: 4 }]}>✨</Animated.Text>
            </Animated.View>

            {/* App name */}
            <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
                MealMate <Animated.Text style={styles.aiText}>AI</Animated.Text>
            </Animated.Text>

            {/* Tagline */}
            <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
                Eat smart. Live better.
            </Animated.Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    logoWrapper: {
        marginBottom: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    logoOuter: {
        width: 100,
        height: 100,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    logoInner: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    logoEmoji: {
        fontSize: 40,
    },
    sparkle: {
        position: "absolute",
        fontSize: 18,
    },
    appName: {
        fontSize: 34,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    aiText: {
        color: "#93C5FD",
    },
    tagline: {
        fontSize: 15,
        color: "rgba(255,255,255,0.65)",
        fontWeight: "400",
        letterSpacing: 0.3,
    },
});
