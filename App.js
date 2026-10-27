import React, { useState, useEffect } from 'react';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import * as Font from 'expo-font';
import { UserProvider, ThemeProvider, SettingsProvider, CartProvider } from './src/context';
import RootNavigator from './src/navigation';
import SplashScreen from './src/SplashScreen';
import { initAnalytics } from './src/analytics';

// Injected global web styles: hide scrollbars while preserving full scrollability
if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const styleId = 'hide-scrollbar-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            *::-webkit-scrollbar,
            ::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
                background: transparent !important;
            }
            * {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashDone, setSplashDone] = useState(false);
    const { width, height } = useWindowDimensions();

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width > 500;

    useEffect(() => {
        initAnalytics();
        Font.loadAsync({
            Casko: require('./assets/casko-luxury-demo.regular.otf'),
        })
            .catch((e) => console.warn('Font load error:', e))
            .finally(() => setFontsLoaded(true));
    }, []);

    const appContent = (
        <UserProvider>
            <ThemeProvider>
                <SettingsProvider>
                    <CartProvider>
                        {/* Main app — invisible while splash is active */}
                        <View style={{ flex: 1, opacity: splashDone ? 1 : 0 }}>
                            <RootNavigator />
                        </View>

                        {/* Custom branded splash — shown once fonts are loaded */}
                        {fontsLoaded && !splashDone && (
                            <SplashScreen onFinish={() => setSplashDone(true)} />
                        )}
                    </CartProvider>
                </SettingsProvider>
            </ThemeProvider>
        </UserProvider>
    );

    if (isDesktop) {
        return (
            <View style={styles.desktopCanvas}>
                <View
                    style={[
                        styles.phoneMockup,
                        {
                            width: Math.min(420, width - 32),
                            height: Math.min(880, height - 40),
                        },
                    ]}
                >
                    {/* Simulated iPhone Dynamic Island */}
                    <View pointerEvents="none" style={styles.dynamicIsland} />
                    <View style={styles.phoneInner}>{appContent}</View>
                </View>
            </View>
        );
    }

    return <View style={styles.mobileContainer}>{appContent}</View>;
}

const styles = StyleSheet.create({
    desktopCanvas: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#07060D',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    phoneMockup: {
        borderRadius: 50,
        borderWidth: 10,
        borderColor: '#242036',
        backgroundColor: '#0D0B1E',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.65,
        shadowRadius: 40,
        elevation: 25,
    },
    dynamicIsland: {
        position: 'absolute',
        top: 10,
        alignSelf: 'center',
        width: 105,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#000000',
        zIndex: 9999,
    },
    phoneInner: {
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    mobileContainer: {
        flex: 1,
    },
});
