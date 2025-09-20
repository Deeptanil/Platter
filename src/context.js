import React, { useMemo, useState, createContext, useContext, useEffect, useRef } from 'react';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'; // Keep imports for provider, but we won't use the themes directly in the same way
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// FIX: Create complete theme objects to avoid dependency issues.
const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    "primary": "#950714",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "#fae0e4",
    "onPrimaryContainer": "rgb(65, 0, 22)",
    "secondary": "rgb(115, 88, 96)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(254, 218, 229)",
    "onSecondaryContainer": "rgb(42, 22, 29)",
    "tertiary": "#9e1b32",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(255, 217, 216)",
    "onTertiaryContainer": "rgb(65, 9, 13)",
    "error": "rgb(179, 38, 30)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(249, 222, 220)",
    "onErrorContainer": "rgb(65, 14, 11)",
    "background": "#f7f4e9",
    "onBackground": "#221112",
    "surface": "#ffffff",
    "onSurface": "#221112",
    "surfaceVariant": "#fae0e4",
    "onSurfaceVariant": "#5a5a5a",
    "outline": "rgb(126, 116, 119)",
    "outlineVariant": "rgb(206, 196, 199)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(50, 47, 48)",
    "inverseOnSurface": "rgb(247, 239, 240)",
    "inversePrimary": "rgb(255, 178, 189)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(248, 242, 244)",
      "level2": "#ffffff",
      "level3": "rgb(238, 232, 235)",
      "level4": "rgb(235, 229, 232)",
      "level5": "rgb(231, 225, 228)"
    },
    "surfaceDisabled": "rgba(29, 27, 28, 0.12)",
    "onSurfaceDisabled": "rgba(29, 27, 28, 0.38)",
    "backdrop": "rgba(52, 47, 49, 0.4)"
  }
};

const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    "primary": "#d44d5c",
    "onPrimary": "rgb(89, 2, 22)",
    "primaryContainer": "rgb(124, 25, 45)",
    "onPrimaryContainer": "rgb(255, 217, 221)",
    "secondary": "rgb(226, 190, 198)",
    "onSecondary": "rgb(65, 43, 50)",
    "secondaryContainer": "rgb(89, 64, 72)",
    "onSecondaryContainer": "rgb(254, 218, 229)",
    "tertiary": "#ff8a80",
    "onTertiary": "rgb(89, 19, 27)",
    "tertiaryContainer": "rgb(124, 43, 50)",
    "onTertiaryContainer": "rgb(255, 217, 216)",
    "error": "rgb(242, 184, 181)",
    "onError": "rgb(105, 24, 20)",
    "errorContainer": "rgb(140, 31, 25)",
    "onErrorContainer": "rgb(249, 222, 220)",
    "background": "#121212",
    "onBackground": "#FFFFFF",
    "surface": "#1E1E1E",
    "onSurface": "#FFFFFF",
    "surfaceVariant": "#2C2C2C",
    "onSurfaceVariant": "#BDBDBD",
    "outline": "rgb(151, 140, 143)",
    "outlineVariant": "rgb(75, 67, 70)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(233, 224, 226)",
    "inverseOnSurface": "rgb(50, 47, 48)",
    "inversePrimary": "rgb(157, 51, 72)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(39, 35, 36)",
      "level2": "#272727",
      "level3": "rgb(51, 44, 46)",
      "level4": "rgb(53, 46, 48)",
      "level5": "rgb(58, 49, 51)"
    },
    "surfaceDisabled": "rgba(233, 224, 226, 0.12)",
    "onSurfaceDisabled": "rgba(233, 224, 226, 0.38)",
    "backdrop": "rgba(52, 47, 49, 0.4)"
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState('light');
    const theme = themeMode === 'dark' ? AppDarkTheme : AppLightTheme;
    return <ThemeContext.Provider value={{ themeMode, setThemeMode, theme }}>{children}</ThemeContext.Provider>;
};
export const useAppTheme = () => useContext(ThemeContext);

const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined);
    const [favorites, setFavorites] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [defaultAddressId, setDefaultAddressId] = useState(null);

    const FALLBACK_LOCATION = { id: 'current_location', type: 'Current Location', line1: 'Unable to fetch location', line2: 'Bengaluru, Karnataka'};

    const loadData = async () => {
        try {
            let currentLocation = FALLBACK_LOCATION;
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                let geocode = await Location.reverseGeocodeAsync(location.coords);
                if (geocode[0]) {
                    const { street, district, city, postalCode } = geocode[0];
                    currentLocation = {
                        id: 'current_location',
                        type: 'Current Location',
                        line1: `${street || ''}, ${district || ''}`,
                        line2: `${city || ''}, ${postalCode || ''}`
                    }
                }
            }

            const userDataJson = await AsyncStorage.getItem('userData');
            setUser(userDataJson ? JSON.parse(userDataJson) : null);

            const favoritesDataJson = await AsyncStorage.getItem('userFavorites');
            setFavorites(favoritesDataJson ? JSON.parse(favoritesDataJson) : []);

            const addressesDataJson = await AsyncStorage.getItem('userAddresses');
            const storedAddresses = addressesDataJson ? JSON.parse(addressesDataJson) : [];
            
            const defaultId = await AsyncStorage.getItem('defaultAddressId');
            setDefaultAddressId(defaultId);
            
            setAddresses([currentLocation, ...storedAddresses]);
            setSelectedAddressId(defaultId || 'current_location');

        } catch (e) {
            console.error("Failed to load data from storage", e);
            setAddresses([FALLBACK_LOCATION]);
            setSelectedAddressId('current_location');
        }
    };
    
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (user !== undefined) {
            AsyncStorage.setItem('userData', JSON.stringify(user));
        }
    }, [user]);

    useEffect(() => {
        const addressesToSave = addresses.filter(addr => addr.id !== 'current_location');
        AsyncStorage.setItem('userAddresses', JSON.stringify(addressesToSave));
    }, [addresses]);
    
    useEffect(() => {
        if (selectedAddressId) {
            AsyncStorage.setItem('selectedAddressId', selectedAddressId);
        }
    }, [selectedAddressId]);

    useEffect(() => {
        if (defaultAddressId) {
            AsyncStorage.setItem('defaultAddressId', defaultAddressId);
        } else {
            AsyncStorage.removeItem('defaultAddressId');
        }
    }, [defaultAddressId]);

    const updateUserProfile = (profileData) => {
        setUser(prevUser => ({...prevUser, ...profileData}));
    };

    const toggleFavorite = async (restaurantId) => {
        const newFavorites = favorites.includes(restaurantId) 
            ? favorites.filter(id => id !== restaurantId) 
            : [...favorites, restaurantId];
        setFavorites(newFavorites);
        await AsyncStorage.setItem('userFavorites', JSON.stringify(newFavorites));
    };

    const addAddress = (address) => {
        const newAddress = { ...address, id: `addr${Date.now()}` };
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
    };

    const updateAddress = (updatedAddress) => {
        setAddresses(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr));
    };

    const deleteAddress = (addressId) => {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        if (selectedAddressId === addressId) {
            setSelectedAddressId('current_location');
        }
        if (defaultAddressId === addressId) {
            setDefaultAddressId(null);
        }
    };

    const selectAddress = (id) => {
        setSelectedAddressId(id);
    };

    const makeDefaultAddress = (id) => {
        setDefaultAddressId(id);
    };

    const resetApp = async () => {
        await AsyncStorage.clear();
        setUser(null);
        setFavorites([]);
        setAddresses([]);
        setSelectedAddressId(null);
        setDefaultAddressId(null);
        loadData();
    };

    const selectedAddress = useMemo(() => {
        return addresses.find(addr => addr.id === selectedAddressId);
    }, [addresses, selectedAddressId]);

    return <UserContext.Provider value={{ user, setUser, updateUserProfile, favorites, toggleFavorite, addresses, selectedAddress, selectAddress, addAddress, updateAddress, deleteAddress, defaultAddressId, makeDefaultAddress, resetApp }}>{children}</UserContext.Provider>;
};
export const useUser = () => useContext(UserContext);

const CartContext = createContext();
export const CartProvider = ({children}) => {
    const [cart, setCart] = useState([]);
    const [lastOrder, setLastOrder] = useState(null);
    const [pastOrders, setPastOrders] = useState([]);

    useEffect(() => {
        const loadPastOrders = async () => {
            const pastOrdersJson = await AsyncStorage.getItem('pastOrders');
            setPastOrders(pastOrdersJson ? JSON.parse(pastOrdersJson) : []);
        };
        loadPastOrders();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('pastOrders', JSON.stringify(pastOrders));
    }, [pastOrders]);
    
    const addToCart = (itemToAdd) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === itemToAdd.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...itemToAdd, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (itemToRemove) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === itemToRemove.id);
            if (existingItem.quantity === 1) {
                return prevCart.filter(item => item.id !== itemToRemove.id);
            } else {
                return prevCart.map(item =>
                    item.id === itemToRemove.id ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
        });
    };

    const removeItemFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };
    
    const clearCart = () => setCart([]);
    
    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const cartItemCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const placeOrder = ({ deliveryFee, taxes, grandTotal }) => {
        const orderId = `#${Math.floor(Math.random() * 90000) + 10000}`;
        const deliveryTime = new Date();
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 35);

        const newOrder = {
            id: orderId,
            items: cart,
            total: grandTotal,
            deliveryFee,
            taxes,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}),
            deliveryTime: deliveryTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        };
        setLastOrder(newOrder);
        setPastOrders(prevOrders => [newOrder, ...prevOrders]);
        clearCart();
    };

    return <CartContext.Provider value={{cart, addToCart, removeFromCart, removeItemFromCart, clearCart, cartTotal, cartItemCount, lastOrder, placeOrder, pastOrders}}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext);

const SettingsContext = createContext();
export const SettingsProvider = ({children}) => {
    const [isVegOnly, setIsVegOnly] = useState(false);
    return <SettingsContext.Provider value={{isVegOnly, setIsVegOnly}}>{children}</SettingsContext.Provider>
}
export const useSettings = () => useContext(SettingsContext);