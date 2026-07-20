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

const { width: SW, height: SH } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
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
        <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
            <StatusBar barStyle="light-content" backgroundColor="#2D0A72" />

            {/* Background gradient — deep purple → rich violet */}
            <LinearGradient
                colors={['#1A0050', '#2D0A72', '#3B0D8A']}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Radial glow blob behind logo */}
            <Animated.View
                style={[
                    styles.glow,
                    {
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
                        <View style={styles.taglineLine} />
                        <Text style={styles.taglineText}>discover. order. savour.</Text>
                        <View style={styles.taglineLine} />
                    </View>
                </Animated.View>
            </View>

            {/* Bottom loading dots */}
            <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
                {[0, 1, 2].map(i => (
                    <PulsingDot key={i} delay={i * 180} />
                ))}
            </Animated.View>
        </Animated.View>
    );
}

// ── Tiny pulsing dot ──────────────────────────────────────────────────────────
function PulsingDot({ delay }) {
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
            style={[styles.dot, { transform: [{ scale }] }]}
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
        width: SW * 0.85,
        height: SW * 0.85,
        borderRadius: SW * 0.425,
        backgroundColor: '#7C3AED',
        // soft radial effect via shadow
        shadowColor: '#8B5CF6',
        shadowOpacity: 1,
        shadowRadius: 120,
        elevation: 20,
    },
    centre: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wordmark: {
        fontFamily: 'Casko',
        fontSize: 68,
        color: '#FFFFFF',
        letterSpacing: 6,
        textShadowColor: 'rgba(139,92,246,0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
    },
    taglineDividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    taglineLine: {
        width: 28,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    taglineText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
        letterSpacing: 2.5,
        fontWeight: '500',
        textTransform: 'lowercase',
    },
    dotsRow: {
        position: 'absolute',
        bottom: SH * 0.1,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});
