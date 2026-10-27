import React, { useMemo, useState, createContext, useContext, useEffect, useRef } from 'react';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'; // Keep imports for provider, but we won't use the themes directly in the same way
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { identifyUser } from './analytics';

// Platter brand theme — electric purple/blue palette
const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    "primary": "#6C3BF5",
    "onPrimary": "#FFFFFF",
    "primaryContainer": "#EDE8FF",
    "onPrimaryContainer": "#21005E",
    "secondary": "#5B4B8A",
    "onSecondary": "#FFFFFF",
    "secondaryContainer": "#E8DEFF",
    "onSecondaryContainer": "#1E0060",
    "tertiary": "#2196F3",
    "onTertiary": "#FFFFFF",
    "tertiaryContainer": "#D6EAFF",
    "onTertiaryContainer": "#001D36",
    "error": "rgb(179, 38, 30)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(249, 222, 220)",
    "onErrorContainer": "rgb(65, 14, 11)",
    "background": "#F5F3FF",
    "onBackground": "#1A0F2E",
    "surface": "#FFFFFF",
    "onSurface": "#1A0F2E",
    "surfaceVariant": "#EDE8FF",
    "onSurfaceVariant": "#4A3F6B",
    "outline": "#7B6BAB",
    "outlineVariant": "#CAC4E0",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "#1A0F2E",
    "inverseOnSurface": "#F5F3FF",
    "inversePrimary": "#C9B8FF",
    "elevation": {
      "level0": "transparent",
      "level1": "#EDE8FF",
      "level2": "#E6DFFF",
      "level3": "#DED6FF",
      "level4": "#D9D0FF",
      "level5": "#D4C9FF"
    },
    "surfaceDisabled": "rgba(26, 15, 46, 0.12)",
    "onSurfaceDisabled": "rgba(26, 15, 46, 0.38)",
    "backdrop": "rgba(50, 35, 90, 0.4)"
  }
};

const AppDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    "primary": "#9D7BFF",
    "onPrimary": "#21005E",
    "primaryContainer": "#4A2BAF",
    "onPrimaryContainer": "#E9DCFF",
    "secondary": "#CAB9FF",
    "onSecondary": "#30196A",
    "secondaryContainer": "#473082",
    "onSecondaryContainer": "#E8DEFF",
    "tertiary": "#63B3FF",
    "onTertiary": "#003155",
    "tertiaryContainer": "#004A80",
    "onTertiaryContainer": "#D6EAFF",
    "error": "rgb(242, 184, 181)",
    "onError": "rgb(105, 24, 20)",
    "errorContainer": "rgb(140, 31, 25)",
    "onErrorContainer": "rgb(249, 222, 220)",
    "background": "#0D0B1E",
    "onBackground": "#E8E0FF",
    "surface": "#1A1730",
    "onSurface": "#E8E0FF",
    "surfaceVariant": "#2A2545",
    "onSurfaceVariant": "#C5B8E8",
    "outline": "#9689C0",
    "outlineVariant": "#4A3F6B",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "#E8E0FF",
    "inverseOnSurface": "#1A0F2E",
    "inversePrimary": "#6C3BF5",
    "elevation": {
      "level0": "transparent",
      "level1": "#201D38",
      "level2": "#252240",
      "level3": "#2A2748",
      "level4": "#2C294C",
      "level5": "#302D54"
    },
    "surfaceDisabled": "rgba(232, 224, 255, 0.12)",
    "onSurfaceDisabled": "rgba(232, 224, 255, 0.38)",
    "backdrop": "rgba(50, 35, 90, 0.6)"
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState('light');
    const [themeLoaded, setThemeLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('themeMode').then(stored => {
            if (stored === 'dark' || stored === 'light') setThemeMode(stored);
            setThemeLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (themeLoaded) AsyncStorage.setItem('themeMode', themeMode);
    }, [themeMode, themeLoaded]);

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

    const FALLBACK_LOCATION = { id: 'current_location', type: 'Current Location', line1: 'Unable to fetch location', line2: 'Mumbai, Maharashtra'};

    const loadData = async () => {
        try {
            let currentLocation = FALLBACK_LOCATION;
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                try {
                    let location = await Location.getCurrentPositionAsync({});
                    let geocode = await Location.reverseGeocodeAsync(location.coords);
                    if (geocode && geocode[0]) {
                        const { street, district, city, postalCode } = geocode[0];
                        const parts1 = [];
                        if (street && street.trim()) parts1.push(street.trim());
                        if (district && district.trim()) parts1.push(district.trim());

                        const parts2 = [];
                        if (city && city.trim()) parts2.push(city.trim());
                        if (postalCode && postalCode.trim()) parts2.push(postalCode.trim());

                        currentLocation = {
                            id: 'current_location',
                            type: 'Current Location',
                            line1: parts1.join(', ') || 'Current Location',
                            line2: parts2.join(', ') || 'Mumbai, Maharashtra'
                        };
                    }
                } catch (locErr) {
                    console.warn('Geocoding service unavailable, using fallback location:', locErr.message);
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
            if (user && (user.id || user.email)) {
                identifyUser(user.email || user.id, {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                });
            } else if (user === null) {
                identifyUser(null);
            }
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
        const loadCartAndOrders = async () => {
            try {
                const storedCart = (await AsyncStorage.getItem('platter_cart')) || (await AsyncStorage.getItem('eatopia_cart'));
                if (storedCart) setCart(JSON.parse(storedCart));

                const pastOrdersJson = await AsyncStorage.getItem('pastOrders');
                setPastOrders(pastOrdersJson ? JSON.parse(pastOrdersJson) : []);
            } catch (e) {
                console.warn('Failed to load cart/orders from storage:', e);
            }
        };
        loadCartAndOrders();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('pastOrders', JSON.stringify(pastOrders));
    }, [pastOrders]);

    useEffect(() => {
        AsyncStorage.setItem('platter_cart', JSON.stringify(cart));
    }, [cart]);
    
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
    const [vegLoaded, setVegLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('isVegOnly').then(stored => {
            if (stored === 'true') setIsVegOnly(true);
            setVegLoaded(true);
        });
    }, []);

    const setIsVegOnlyPersisted = (val) => {
        setIsVegOnly(val);
        AsyncStorage.setItem('isVegOnly', val ? 'true' : 'false');
    };

    return <SettingsContext.Provider value={{isVegOnly, setIsVegOnly: setIsVegOnlyPersisted}}>{children}</SettingsContext.Provider>
}
export const useSettings = () => useContext(SettingsContext);