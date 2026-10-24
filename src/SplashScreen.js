import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from './context';

const { width: RAW_SW, height: SH } = Dimensions.get('window');
const SW = Platform.OS === 'web' ? Math.min(RAW_SW, 420) : RAW_SW;

export default function SplashScreen({ onFinish }) {
    const { theme } = useAppTheme();
    const isDark = theme.dark;

    // ── Animation values ─────────────────────────────────────────────────────
    const logoOpacity   = useRef(new Animated.Value(0)).current;
    const logoScale     = useRef(new Animated.Value(0.72)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineY      = useRef(new Animated.Value(14)).current;
    const dotsOpacity   = useRef(new Animated.Value(0)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    // Pulsing glow behind the wordmark
    const glowScale     = useRef(new Animated.Value(0.85)).current;
    const glowOpacity   = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Glow blooms in
        Animated.parallel([
            Animated.timing(glowOpacity, {
                toValue: 0.35,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(glowScale, {
                toValue: 1.15,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // 2. Wordmark fades + scales in (slight delay)
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // 3. Tagline slides up
        Animated.sequence([
            Animated.delay(800),
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(taglineY, {
                    toValue: 0,
                    friction: 7,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // 4. Dots appear
        Animated.sequence([
            Animated.delay(1100),
            Animated.timing(dotsOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // 5. Fade entire splash out → call onFinish
        Animated.sequence([
            Animated.delay(2400),
            Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 550,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onFinish && onFinish();
        });
    }, []);

    return (
        <Animated.View style={[styles.root, { opacity: screenOpacity, backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            {/* Background gradient — dynamic purple modes */}
            <LinearGradient
                colors={isDark ? ['#0D0B1E', '#1A1730', '#251F45'] : ['#FFFFFF', '#F5F3FF', '#EDE8FF']}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Radial glow blob behind logo */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: isDark ? '#7C3AED' : '#C9B8FF',
                        shadowColor: isDark ? '#8B5CF6' : '#9D7BFF',
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />

            {/* Centre content */}
            <View style={styles.centre}>
                {/* Wordmark */}
                <Animated.Text
                    style={[
                        styles.wordmark,
                        {
                            color: isDark ? '#FFFFFF' : '#6C3BF5',
                            textShadowColor: isDark ? 'rgba(139,92,246,0.8)' : 'rgba(108,59,245,0.25)',
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    eatopia
                </Animated.Text>

                {/* Tagline */}
                <Animated.View
                    style={{
                        opacity: taglineOpacity,
                        transform: [{ translateY: taglineY }],
                        marginTop: 14,
                        alignItems: 'center',
                    }}
                >
                    <View style={styles.taglineDividerWrap}>
                        <View style={[styles.taglineLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(108,59,245,0.35)' }]} />
                        <Text style={[styles.taglineText, { color: isDark ? 'rgba(255,255,255,0.55)' : '#5B4B8A' }]}>discover. order. savour.</Text>
                        <View style={[styles.taglineLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(108,59,245,0.35)' }]} />
                    </View>
                </Animated.View>
            </View>

            {/* Bottom loading dots */}
            <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
                {[0, 1, 2].map(i => (
                    <PulsingDot key={i} delay={i * 180} isDark={isDark} />
                ))}
            </Animated.View>
        </Animated.View>
    );
}

// ── Tiny pulsing dot ──────────────────────────────────────────────────────────
function PulsingDot({ delay, isDark }) {
    const scale = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(scale, {
                    toValue: 1.2,
                    duration: 420,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.6,
                    duration: 420,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[styles.dot, { transform: [{ scale }], backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(108,59,245,0.5)' }]}
        />
    );
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    glow: {
        position: 'absolute',
        width: Math.min(SW * 0.8, 300),
        height: Math.min(SW * 0.8, 300),
        borderRadius: 150,
        shadowOpacity: 0.8,
        shadowRadius: 80,
        elevation: 15,
    },
    centre: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    wordmark: {
        fontFamily: 'Casko',
        fontSize: 52,
        letterSpacing: 4,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    taglineDividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    taglineLine: {
        width: 28,
        height: 1,
    },
    taglineText: {
        fontSize: 11,
        letterSpacing: 2.5,
        fontWeight: '500',
        textTransform: 'lowercase',
    },
    dotsRow: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
