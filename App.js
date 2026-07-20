import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import * as Font from 'expo-font';
import { UserProvider, ThemeProvider, SettingsProvider, CartProvider } from './src/context';
import RootNavigator from './src/navigation';
import SplashScreen from './src/SplashScreen';

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [splashDone, setSplashDone] = useState(false);

    useEffect(() => {
        Font.loadAsync({
            Casko: require('./assets/casko-luxury-demo.regular.otf'),
        })
            .catch((e) => console.warn('Font load error:', e))
            .finally(() => setFontsLoaded(true));
    }, []);

    return (
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
}
