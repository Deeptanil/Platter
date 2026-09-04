import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme, useUser } from './context';

// Named loading placeholder — fixes React Navigation inline-function warning
const LoadingScreen = () => <View style={{ flex: 1 }} />;
import {
    AuthScreen, HomeScreen, RestaurantDetailsScreen, CartScreen,
    MyCollectionsScreen, SettingsScreen, CheckoutScreen,
    OrderConfirmationScreen, AddressListScreen, DeliveryDetailsScreen,
    SearchScreen, PastOrdersScreen, ProfileScreen
} from './screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Apple Floating Dock Tab Bar ─────────────────────────────────────────────
const FloatingTabBar = ({ state, navigation, theme }) => {
    const insets = useSafeAreaInsets();

    const TABS = [
        { key: 'Home', label: 'Home', icon: 'home-variant', iconActive: 'home-variant' },
        { key: 'Under250', label: 'Under 250', icon: 'currency-inr', iconActive: 'currency-inr' },
        { key: 'Healthy', label: 'Healthy', icon: 'leaf-circle-outline', iconActive: 'leaf-circle' },
    ];

    return (
        <View style={[dockStyles.outerWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <BlurView
                intensity={theme.dark ? 70 : 80}
                tint={theme.dark ? 'dark' : 'light'}
                style={[
                    dockStyles.dock,
                    {
                        borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                        backgroundColor: theme.dark ? 'rgba(15,12,30,0.6)' : 'rgba(255,255,255,0.55)',
                    },
                ]}
            >
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const tab = TABS[index];

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={dockStyles.tabItem}
                            onPress={() => navigation.navigate(route.name)}
                            activeOpacity={0.75}
                        >
                            {isFocused ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#6C3BF5']}
                                    style={dockStyles.activePill}
                                >
                                    <MaterialCommunityIcons name={tab.iconActive} size={18} color="#FFF" />
                                    <Text style={dockStyles.activeLabel} numberOfLines={1}>{tab.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={dockStyles.inactiveItem}>
                                    <MaterialCommunityIcons
                                        name={tab.icon}
                                        size={20}
                                        color={theme.dark ? 'rgba(255,255,255,0.45)' : 'rgba(108,59,245,0.45)'}
                                    />
                                    <Text style={[dockStyles.inactiveLabel, { color: theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(108,59,245,0.4)' }]} numberOfLines={1}>
                                        {tab.label}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
const BottomTabs = () => {
    const { theme } = useAppTheme();
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} theme={theme} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{ filterMode: 'all' }} />
            <Tab.Screen name="Under250" component={HomeScreen} initialParams={{ filterMode: 'under250' }} />
            <Tab.Screen name="Healthy" component={HomeScreen} initialParams={{ filterMode: 'healthy' }} />
        </Tab.Navigator>
    );
};

// ─── Main App Stack ────────────────────────────────────────────────────────────
const MainAppStack = () => {
    const { theme } = useAppTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false,
                headerTintColor: theme.colors.primary,
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ animation: 'slide_from_bottom', title: 'Your Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_bottom', title: 'Checkout' }} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="MyCollections" component={MyCollectionsScreen} options={{ title: 'My Collections' }} />
            <Stack.Screen name="PastOrders" component={PastOrdersScreen} options={{ title: 'Past Orders' }} />
            <Stack.Screen name="MyAddresses" component={AddressListScreen} options={{ title: 'My Addresses' }} />
            <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} options={{ title: 'Delivery Details', animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
};

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function RootNavigator() {
    const { theme } = useAppTheme();
    const { user } = useUser();

    const navTheme = useMemo(() => {
        const base = theme.dark ? DarkTheme : DefaultTheme;
        return {
            ...base,
            colors: {
                ...base.colors,
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.surface,
                text: theme.colors.onSurface,
                border: 'transparent',
                notification: theme.colors.tertiary,
            },
        };
    }, [theme]);

    return (
        <PaperProvider theme={theme}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <NavigationContainer theme={navTheme}>
                    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
                        {user === undefined ? (
                            <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
                        ) : user ? (
                            <Stack.Screen name="MainApp" component={MainAppStack} options={{ headerShown: false }} />
                        ) : (
                            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
        </PaperProvider>
    );
}

// ─── Dock Styles ──────────────────────────────────────────────────────────────
const dockStyles = StyleSheet.create({
    outerWrap: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
    },
    dock: {
        flexDirection: 'row',
        borderRadius: 36,
        borderWidth: 1.5,
        paddingVertical: 5,
        paddingHorizontal: 5,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: 28,
        gap: 6,
        width: '95%',
        height: 42,
    },
    activeLabel: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    inactiveItem: { alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' },
    inactiveLabel: { fontSize: 10, marginTop: 2, fontWeight: '600' },
});