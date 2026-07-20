import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, useUser } from './context';
import { AuthScreen, HomeScreen, RestaurantDetailsScreen, CartScreen, MyCollectionsScreen, SettingsScreen, CheckoutScreen, OrderConfirmationScreen, AddressListScreen, DeliveryDetailsScreen, SearchScreen, PastOrdersScreen, ProfileScreen } from './screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom Tab Bar ──────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation, theme }) => {
    const insets = useSafeAreaInsets();

    const TABS = [
        { key: 'Home', label: 'Home', icon: 'home' },
        { key: 'Under250', label: 'Under \u20b9250', icon: 'currency-inr' },
        { key: 'Healthy', label: 'Healthy', icon: 'leaf' },
    ];

    const barBg = theme.dark ? '#1a1a2e' : '#FFFFFF';
    const activeTint = theme.colors.primary;
    const inactiveTint = theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
    const borderColor = theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

    return (
        <View style={[tabStyles.container, { backgroundColor: barBg, borderTopColor: borderColor, paddingBottom: insets.bottom || 8 }]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const tab = TABS[index];

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={tabStyles.tab}
                        onPress={() => navigation.navigate(route.name)}
                        activeOpacity={0.7}
                    >
                        <View style={[tabStyles.iconWrap, isFocused && { backgroundColor: activeTint + '18' }]}>
                            <MaterialCommunityIcons
                                name={tab.icon}
                                size={22}
                                color={isFocused ? activeTint : inactiveTint}
                            />
                        </View>
                        <Text style={[tabStyles.label, { color: isFocused ? activeTint : inactiveTint }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ─── Bottom Tab Navigator ────────────────────────────────────────────────────
const BottomTabs = () => {
    const { theme } = useAppTheme();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{ filterMode: 'all' }} />
            <Tab.Screen name="Under250" component={HomeScreen} initialParams={{ filterMode: 'under250' }} />
            <Tab.Screen name="Healthy" component={HomeScreen} initialParams={{ filterMode: 'healthy' }} />
        </Tab.Navigator>
    );
};

// ─── Main Stack ─────────────────────────────────────────────────────────────
const MainAppStack = () => {
    const { theme } = useAppTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false,
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: { fontWeight: 'bold' },
                animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="MyCollections" component={MyCollectionsScreen} options={{ title: 'My Collections' }} />
            <Stack.Screen name="PastOrders" component={PastOrdersScreen} options={{ title: 'Past Orders' }} />
            <Stack.Screen name="MyAddresses" component={AddressListScreen} options={{ title: 'My Addresses' }} />
            <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} options={{ title: 'Delivery Details', animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
};

// ─── Root Navigator ──────────────────────────────────────────────────────────
export default function RootNavigator() {
    const { theme } = useAppTheme();
    const { user } = useUser();

    const navTheme = useMemo(() => {
        const currentNavTheme = theme.dark ? DarkTheme : DefaultTheme;
        return {
            ...currentNavTheme,
            colors: {
                ...currentNavTheme.colors,
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.background,
                text: theme.colors.onSurface,
                border: theme.colors.surfaceVariant,
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
                            <Stack.Screen name="Loading" component={() => <View />} options={{ headerShown: false }} />
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
};

const tabStyles = StyleSheet.create({
    container: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    iconWrap: { width: 44, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 3 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
});