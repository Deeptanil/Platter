import React, { useMemo } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

import { useAppTheme, useUser } from './context';
import { AuthScreen, HomeScreen, RestaurantDetailsScreen, CartScreen, MyCollectionsScreen, SettingsScreen, CheckoutScreen, OrderConfirmationScreen, AddressListScreen, DeliveryDetailsScreen, SearchScreen, PastOrdersScreen, ProfileScreen } from './screens';

const Stack = createNativeStackNavigator();

const MainAppStack = () => {
    const { theme } = useAppTheme();
    return (
        <Stack.Navigator
             screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false, // This line removes the header shadow
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: { fontWeight: 'bold' },
                animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }}/>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }}/>
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} options={{ title: "" }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ animation: 'slide_from_bottom' }}/>
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_bottom' }}/>
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="MyCollections" component={MyCollectionsScreen} options={{title: "My Collections"}} />
            <Stack.Screen name="PastOrders" component={PastOrdersScreen} options={{title: "Past Orders"}}/>
            <Stack.Screen name="MyAddresses" component={AddressListScreen} options={{title: "My Addresses"}}/>
            <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} options={{title: "Delivery Details", animation: 'slide_from_bottom'}}/>
        </Stack.Navigator>
    );
};

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
                    <Stack.Navigator screenOptions={{contentStyle: {backgroundColor: 'transparent'}}}>
                        {user === undefined ? (
                            <Stack.Screen name="Loading" component={() => <View />} options={{ headerShown: false }} />
                        ) : user ? (
                           <Stack.Screen name="MainApp" component={MainAppStack} options={{ headerShown: false }}/>
                        ) : (
                           <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }}/>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
        </PaperProvider>
    );
};