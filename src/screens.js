import React, { useState, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Image, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Modal, SafeAreaView, SectionList, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text, Searchbar, Switch, Avatar, List, Divider, Button, Checkbox, Card, IconButton, RadioButton, SegmentedButtons, Menu, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppTheme, useSettings, useUser, useCart } from './context';
import { BigRestaurantCard, RecommendedCard, CartFAB, GlassCard, GlassInput, AppBackground, GlassButton } from './components';
import { ALL_RESTAURANTS, CATEGORIES, RECOMMENDED_RESTAURANTS_IDS, EXPLORE_MORE, MOODS } from './data';

const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export const AuthScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { setUser } = useUser();
    const [stage, setStage] = useState('welcome');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [receiveUpdates, setReceiveUpdates] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const insets = useSafeAreaInsets();

    const titleY = useSharedValue(-300);
    const cardOpacity = useSharedValue(0);

    const animatedTitleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: titleY.value }] }));
    const animatedCardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));

    useEffect(() => {
        titleY.value = withSpring(0, { damping: 12, stiffness: 90 });
        cardOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    }, []);
    
    const handleBack = () => {
        triggerHaptic();
        if (stage === 'phone') setStage('welcome');
        if (stage === 'details') setStage('phone');
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (stage === 'welcome') {
                return;
            }
            e.preventDefault();
            handleBack();
        });
        return unsubscribe;
    }, [navigation, stage]);


    const validateEmail = (text) => {
        if (text.length === 0) {
            setIsEmailValid(true);
            return;
        }
        const regex = /\S+@\S+\.\S+/;
        setIsEmailValid(regex.test(text));
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        validateEmail(text);
    };

    const handlePrimaryAction = () => {
        triggerHaptic();
        if (stage === 'welcome') setStage('phone');
        else if (stage === 'phone' && phone.length === 10) setStage('details');
        else if (stage === 'details' && name && isEmailValid) {
            setUser({ name, email, phone });
            navigation.replace('MainApp');
        }
    };
    
    return (
        <AppBackground>
            <SafeAreaView style={{flex: 1}}>
                <Modal transparent visible={isPopupVisible} animationType="fade" onRequestClose={() => setPopupVisible(false)}>
                    <BlurView intensity={50} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
                        <Pressable style={styles.modalOverlay} onPress={() => setPopupVisible(false)}>
                            <GlassCard blur={true} style={styles.popupContainer}>
                                <Text style={[styles.popupTitle, {color: theme.dark ? '#FFFFFF' : theme.colors.onSurface}]}>Location Information</Text>
                                <Text style={[styles.popupText, {color: theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant}]}>This app is currently functional only in Bengaluru.</Text>
                                <GlassButton title="OK" onPress={() => setPopupVisible(false)} style={{width: '100%'}}/>
                            </GlassCard>
                        </Pressable>
                    </BlurView>
                </Modal>
                {stage !== 'welcome' && (
                    <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={handleBack}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color={theme.dark ? '#FFFFFF' : theme.colors.onSurface} />
                    </TouchableOpacity>
                )}
                
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={styles.authContent}>

                            {stage === 'welcome' && (
                                <View style={styles.stageContainer}>
                                    <Animated.View style={animatedTitleStyle}>
                                        <Text style={[styles.appNameTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface }]}>Eatopia</Text>
                                    </Animated.View>
                                    <Animated.View style={[{width: '100%'}, animatedCardStyle]}>
                                        <GlassCard>
                                            <Text variant="headlineLarge" style={[styles.authTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface }]}>Welcome</Text>
                                            <Text variant="bodyLarge" style={[styles.authSubtitle, { color: theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant }]}>Where every craving comes together.</Text>
                                        </GlassCard>
                                        <GlassButton title="Next" icon="arrow-right" onPress={handlePrimaryAction}/>
                                    </Animated.View>
                                </View>
                            )}

                            {stage === 'phone' && (
                                <Animated.View entering={FadeIn.duration(500)} style={styles.stageContainer}>
                                    <Text style={[styles.stageTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface }]}>Where can we call you?</Text>
                                    <View style={{width: '100%'}}>
                                        <GlassCard>
                                            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                                <TouchableOpacity style={[styles.countryCodeButton, {backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)', borderColor: theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.1)'}]} onPress={() => setPopupVisible(true)}>
                                                    <Text style={{ color: theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant, fontSize: 16, textAlign: 'center' }}>+91</Text>
                                                </TouchableOpacity>
                                                <View style={{flex: 1}}>
                                                    <GlassInput label="Mobile Number" value={phone} onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={10} />
                                                </View>
                                            </View>
                                            <Checkbox.Item
                                                label="I'd like to get message updates"
                                                status={receiveUpdates ? 'checked' : 'unchecked'}
                                                onPress={() => setReceiveUpdates(!receiveUpdates)}
                                                color={theme.colors.primary}
                                                uncheckedColor={theme.dark ? "#E0E0E0" : theme.colors.onSurfaceVariant}
                                                labelStyle={{color: theme.dark ? "#E0E0E0" : theme.colors.onSurfaceVariant, fontSize: 14}}
                                                style={{width: '100%', marginTop: 10}}
                                            />
                                        </GlassCard>
                                        <GlassButton title="Next" icon="arrow-right" onPress={handlePrimaryAction}/>
                                    </View>
                                </Animated.View>
                            )}

                            {stage === 'details' && (
                                <ScrollView
                                    style={{ width: '100%' }}
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-around' }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Animated.View entering={FadeIn.duration(500)} style={{alignItems: 'center', width: '100%'}}>
                                        <Text style={[styles.stageTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface }]}>Getting to know you</Text>
                                        <View style={{width: '100%', marginTop: 40}}>
                                            <GlassCard style={{paddingVertical: 30}}>
                                                <GlassInput label="Name (Required)" value={name} onChangeText={setName} />
                                                <View style={{height: 24}}/>
                                                <GlassInput label="Email (Optional)" value={email} onChangeText={handleEmailChange} keyboardType="email-address" error={!isEmailValid} />
                                                {!isEmailValid && <Text style={styles.errorText}>Please enter a valid email address.</Text>}
                                            </GlassCard>
                                            <GlassButton title="Finish" icon="arrow-right" onPress={handlePrimaryAction}/>
                                        </View>
                                    </Animated.View>
                                </ScrollView>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AppBackground>
    );
};

const HomeScreenHeader = ({ navigation, theme, isVegOnly, setIsVegOnly, selectedCategory, setSelectedCategory, selectedMood, setSelectedMood, confettiRef, netInfo }) => {
    const { user, selectedAddress } = useUser();
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

    const glassStyle = theme.dark ? { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)', borderWidth: 1 } : { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(255, 255, 255, 0.7)', borderWidth: 1 };
    const bannerGlassStyle = theme.dark ? { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1 } : { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1 };

    return (
        <>
            <View style={[styles.header]}>
                <TouchableOpacity onPress={() => navigation.navigate('MyAddresses')} style={{flex: 1}}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Deliver to</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                         <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }} numberOfLines={1}>{selectedAddress?.type} - {selectedAddress?.line1}</Text>
                         <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>
                <Pressable onPress={() => navigation.navigate('Settings')} style={{marginLeft: 16}}>
                     <Avatar.Text 
                        size={40} 
                        label={userInitial} 
                        style={{ backgroundColor: theme.colors.primary }}
                        color={theme.dark ? theme.colors.background : "#FFFFFF"}
                    />
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <Pressable onPress={() => navigation.navigate('Search')} style={{flex: 1}}>
                    <View style={[styles.searchBar, glassStyle, {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18}]} pointerEvents="none">
                        <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.onSurfaceVariant} />
                        <Text style={{marginLeft: 8, color: theme.colors.onSurfaceVariant}}>Search restaurants or dishes</Text>
                    </View>
                </Pressable>
                <View style={styles.vegToggleContainer}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>Veg</Text>
                    <Switch value={isVegOnly} onValueChange={setIsVegOnly} color={theme.colors.primary} />
                </View>
            </View>
            
            <TouchableOpacity onPress={() => confettiRef.current?.start()}>
                <View style={[styles.banner, bannerGlassStyle]}>
                     <MaterialCommunityIcons name="motorbike" color={theme.colors.primary} size={24}/>
                    <Text style={{color: theme.colors.onSurface, marginLeft: 10, fontWeight: 'bold'}}>Free Delivery on orders over ₹300!</Text>
                </View>
            </TouchableOpacity>

            {netInfo?.isInternetReachable === false && (
                <View style={[styles.networkBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name="wifi-off" color={theme.colors.onSurfaceVariant} size={20}/>
                    <Text style={{color: theme.colors.onSurfaceVariant, marginLeft: 10, fontWeight: '500'}}>You are offline. Content may be outdated.</Text>
                </View>
            )}
            
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginHorizontal: 16, marginBottom: 12 }}>Categories</Text>
            <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryItem} onPress={() => setSelectedCategory(item.name)}>
                        <Image source={{ uri: item.image }} style={[styles.categoryImage, selectedCategory === item.name && {borderColor: theme.colors.primary, borderWidth: 2}]} />
                        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingLeft: 16}}
            />

            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginHorizontal: 16, marginBottom: 12, marginTop: 24 }}>What's Your Mood?</Text>
            <FlatList
                horizontal
                data={MOODS}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[styles.moodItem, {backgroundColor: theme.colors.surfaceVariant}, selectedMood === item.key && {backgroundColor: theme.colors.primary}]} 
                        onPress={() => setSelectedMood(prev => prev === item.key ? null : item.key)}>
                        <MaterialCommunityIcons name={item.icon} size={24} color={selectedMood === item.key ? (theme.dark ? theme.colors.background : '#FFFFFF') : theme.colors.primary} />
                        <Text style={{ color: selectedMood === item.key ? (theme.dark ? theme.colors.background : '#FFFFFF') : theme.colors.onSurface, marginTop: 8, textAlign: 'center' }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingLeft: 16}}
            />
            
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginHorizontal: 16, marginBottom: 16, marginTop: 24 }}>{selectedCategory === 'All' ? 'All Restaurants' : `Restaurants serving ${selectedCategory}`}</Text>
        </>
    );
};
export const HomeScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { isVegOnly, setIsVegOnly } = useSettings();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedMood, setSelectedMood] = useState(null);
    const confettiRef = useRef(null);
    const insets = useSafeAreaInsets();
    const netInfo = useNetInfo();

    const filteredRestaurants = useMemo(() => {
        let restaurants = ALL_RESTAURANTS;

        if (isVegOnly) {
            restaurants = restaurants.filter(res => res.isVeg);
        }

        restaurants = restaurants.filter(res => {
            const matchesCategory = selectedCategory === 'All' || res.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
            const matchesMood = !selectedMood || (res.moods && res.moods.includes(selectedMood));
            return matchesCategory && matchesMood;
        });
        
        return restaurants;
    }, [isVegOnly, selectedCategory, selectedMood]);
    
    const renderRestaurantCard = useCallback(({ item, index }) => (
        <BigRestaurantCard 
            restaurant={item} 
            theme={theme} 
            navigation={navigation} 
            index={index} 
        />
    ), [theme, navigation]);

    return (
        <AppBackground>
            <FlatList
                data={filteredRestaurants}
                keyExtractor={(item) => item.id}
                renderItem={renderRestaurantCard}
                ListHeaderComponent={
                    <HomeScreenHeader 
                        navigation={navigation}
                        theme={theme}
                        isVegOnly={isVegOnly}
                        setIsVegOnly={setIsVegOnly}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedMood={selectedMood}
                        setSelectedMood={setSelectedMood}
                        confettiRef={confettiRef}
                        netInfo={netInfo}
                    />
                }
                ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><Text style={{color: theme.colors.onSurface}}>No restaurants found. Try changing your filters!</Text></View>}
                contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 80 }}
            />
            <CartFAB navigation={navigation}/>
            <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={false} ref={confettiRef} fadeOut/>
        </AppBackground>
    );
};

const MenuItemCard = ({ item, restaurant }) => {
    const { theme } = useAppTheme();
    const { cart, addToCart, removeFromCart } = useCart();
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const QuantityButton = () => (
        <View style={[styles.quantityContainer, {backgroundColor: theme.colors.primary}]}>
            <IconButton icon="minus" onPress={() => { triggerHaptic(); removeFromCart(item); }} iconColor={"#FFFFFF"} size={20} style={{margin: 0, height: 36, width: 36}}/>
            <Text style={{color: "#FFFFFF", fontWeight: 'bold', fontSize: 18}}>{quantity}</Text>
            <IconButton icon="plus" onPress={() => { triggerHaptic(); addToCart(item); }} iconColor={"#FFFFFF"} size={20} style={{margin: 0, height: 36, width: 36}}/>
        </View>
    );

    const AddButton = () => (
        <TouchableOpacity 
            style={[styles.addButton, {backgroundColor: theme.colors.primary}]} 
            onPress={() => { triggerHaptic(); addToCart({...item, restaurantName: restaurant.name}); }}>
            <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>ADD</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.menuItemContainer, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
            <View style={{flex: 1, paddingRight: 16}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <MaterialCommunityIcons name={item.isVeg ? 'leaf-circle' : 'food-variant'} color={item.isVeg ? 'green' : 'red'} size={20} style={{marginRight: 8}}/>
                    <Text variant="titleMedium" style={{flex: 1, color: theme.colors.onSurface}}>{item.name}</Text>
                </View>
                <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>₹{item.price}</Text>
            </View>
            <View style={{width: 110}}>
                {quantity > 0 ? <QuantityButton/> : <AddButton/>}
            </View>
        </View>
    );
}

export const RestaurantDetailsScreen = ({ navigation, route }) => {
    const { restaurant } = route.params;
    const { theme } = useAppTheme();
    const [activeFilter, setActiveFilter] = useState('all');
    const [menuSearchQuery, setMenuSearchQuery] = useState('');

    const hasNonVeg = restaurant.menu.some(item => !item.isVeg);

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#4CAF50';
        if (rating >= 3) return '#FF9800';
        return '#F44336';
    };

    const menuFilters = useMemo(() => {
        const filters = ['all', 'veg'];
        if (hasNonVeg) {
            filters.push('non-veg');
        }
        filters.push('spicy', 'highly ordered');
        return filters;
    }, [hasNonVeg]);


    const flatFilteredMenu = useMemo(() => {
        let menu = restaurant.menu.map(item => ({
            ...item,
            isHighlyOrdered: restaurant.highlyOrdered?.includes(item.id) || false
        }));
        
        if (menuSearchQuery) {
            menu = menu.filter(item => item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()));
        }

        if (activeFilter !== 'all') {
            menu = menu.filter(item => {
                if (activeFilter === 'veg') return item.isVeg;
                if (activeFilter === 'non-veg') return !item.isVeg;
                if (activeFilter === 'spicy') return item.isSpicy;
                if (activeFilter === 'highly ordered') return item.isHighlyOrdered;
                return true;
            });
        }
        
        return menu;
    }, [menuSearchQuery, activeFilter, restaurant.menu, restaurant.highlyOrdered]);


    return (
        <AppBackground>
            <FlatList
                data={flatFilteredMenu}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <MenuItemCard item={item} restaurant={restaurant} />}
                ListHeaderComponent={() => (
                    <>
                        <View style={{padding: 16}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <View style={{flex: 1}}>
                                    <Text variant="headlineMedium" style={{fontWeight: 'bold', color: theme.colors.onSurface}}>{restaurant.name}</Text>
                                    <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>{restaurant.distance}</Text>
                                    <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{restaurant.deliveryTime} mins</Text>
                                </View>
                                <View style={[styles.ratingBox, {backgroundColor: getRatingColor(restaurant.rating)}]}>
                                    <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>{restaurant.rating} ★</Text>
                                </View>
                            </View>
                            {restaurant.offer && <Text style={{color: theme.colors.primary, fontWeight: 'bold', marginTop: 8}}>• {restaurant.offer}</Text>}
                        </View>

                        <Divider style={{marginHorizontal: 16}}/>
                        
                        <View style={{padding: 16}}>
                            <FlatList
                                horizontal
                                data={menuFilters}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({item}) => (
                                     <TouchableOpacity 
                                        style={[styles.pillButton, {backgroundColor: theme.dark ? theme.colors.surface : 'rgba(0,0,0,0.05)'}, activeFilter === item ? {backgroundColor: theme.colors.primary} : {}]} 
                                        onPress={() => {triggerHaptic(); setActiveFilter(item);}}
                                     >
                                        <Text style={{color: activeFilter === item ? "#FFFFFF" : theme.colors.onSurface}}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <Text variant="titleLarge" style={{fontWeight: 'bold', color: theme.colors.onSurface, marginLeft: 16, marginBottom: 8}}>Menu</Text>
                    </>
                )}
                contentContainerStyle={{paddingBottom: 80}}
            />
            <CartFAB navigation={navigation}/>
        </AppBackground>
    );
};

const CartItemCard = ({ item }) => {
    const { theme } = useAppTheme();
    const { addToCart, removeFromCart, removeItemFromCart } = useCart();
    
    return (
        <View style={[styles.cartItemContainer, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
            <View style={{flex: 1, paddingRight: 16}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text variant="titleMedium" style={{flex: 1, flexShrink: 1, color: theme.colors.onSurface}}>{item.name}</Text>
                </View>
                <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>₹{item.price * item.quantity}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={[styles.quantityContainer, {backgroundColor: theme.colors.primary, marginRight: 8}]}>
                    <IconButton icon="minus" onPress={() => removeFromCart(item)} iconColor={"#FFFFFF"} size={20} style={{margin: 0, height: 36, width: 36}}/>
                    <Text style={{color: "#FFFFFF", fontWeight: 'bold', fontSize: 18}}>{item.quantity}</Text>
                    <IconButton icon="plus" onPress={() => addToCart(item)} iconColor={"#FFFFFF"} size={20} style={{margin: 0, height: 36, width: 36}}/>
                </View>
                <IconButton icon="close-circle" onPress={() => removeItemFromCart(item.id)} iconColor={theme.colors.onSurfaceVariant} size={24}/>
            </View>
        </View>
    )
}

export const CartScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { cart } = useCart();
    
    const cartSections = useMemo(() => {
        const grouped = cart.reduce((acc, item) => {
            const { restaurantName } = item;
            if (!acc[restaurantName]) {
                acc[restaurantName] = [];
            }
            acc[restaurantName].push(item);
            return acc;
        }, {});

        return Object.keys(grouped).map(key => ({
            title: key,
            data: grouped[key]
        }));
    }, [cart]);


    return (
        <AppBackground>
            <FlatList
                data={cartSections}
                keyExtractor={(item) => item.title}
                ListHeaderComponent={() => <Text variant="headlineMedium" style={{marginHorizontal: 16, marginTop: 16, marginBottom: 24, fontWeight: 'bold', color: theme.colors.onSurface}}>Your Order</Text>}
                renderItem={({item}) => (
                    <GlassCard style={{ marginHorizontal: 16, padding: 16, alignItems: 'flex-start' }}>
                        <Text variant="titleLarge" style={{color: theme.colors.onSurface, marginBottom: 12}}>{item.title}</Text>
                        {item.data.map(dish => <CartItemCard key={dish.id} item={dish} />)}
                    </GlassCard>
                )}
                ListFooterComponent={() => (
                    <>
                        {cart.length > 0 && (
                            <View style={{padding: 16, marginTop: 8}}>
                                <GlassButton title="Review Order & Address" onPress={() => navigation.navigate('Checkout')} />
                            </View>
                        )}
                    </>
                )}
                ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><Text style={{color: theme.colors.onSurface, fontSize: 16}}>Your cart is empty.</Text></View>}
                contentContainerStyle={{paddingBottom: 40}}
            />
        </AppBackground>
    );
};

export const CheckoutScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { cart, cartTotal, placeOrder } = useCart();
    const { selectedAddress } = useUser();
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [tip, setTip] = useState(0);
    const originalDeliveryFee = 25;

    const deliveryFee = cartTotal > 300 ? 0 : originalDeliveryFee;
    const convenienceFee = cartTotal * 0.02;
    const taxes = cartTotal * 0.18;
    const grandTotal = cartTotal + deliveryFee + taxes + convenienceFee + tip;

    const handlePlaceOrder = () => {
        triggerHaptic();
        placeOrder({ deliveryFee, taxes, grandTotal });
        navigation.navigate('OrderConfirmation');
    };

    return (
        <AppBackground>
            <ScrollView contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 100}}>
                <GlassCard style={{alignItems: 'flex-start'}}>
                    <Text variant="titleLarge" style={{color: theme.colors.onSurface, marginBottom: 16}}>Delivery Address</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                        <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
                        <View style={{flex: 1, marginLeft: 16}}>
                            <Text variant="bodyLarge" style={{color: theme.colors.onSurface, fontWeight: 'bold'}}>{selectedAddress?.type}</Text>
                            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{`${selectedAddress?.line1}, ${selectedAddress?.line2}`}</Text>
                        </View>
                        <Button onPress={() => navigation.navigate('MyAddresses')}>Edit</Button>
                    </View>
                </GlassCard>
                <GlassCard style={{alignItems: 'flex-start', paddingVertical: 8}}>
                    <List.Section style={{width: '100%'}}>
                        <List.Subheader>Order Summary</List.Subheader>
                         {cart.map(item => (
                            <List.Item
                                key={item.id}
                                title={`${item.name} x ${item.quantity}`}
                                titleStyle={{color: theme.colors.onSurface}}
                                right={() => <Text style={{color: theme.colors.onSurfaceVariant}}>₹{item.price * item.quantity}</Text>}
                            />
                         ))}
                    </List.Section>
                </GlassCard>
                <GlassCard style={{alignItems: 'flex-start'}}>
                     <Text variant="titleLarge" style={{color: theme.colors.onSurface, marginBottom: 16}}>Add a tip</Text>
                     <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                        {[0, 10, 20, 30].map(tipValue => (
                             <TouchableOpacity key={tipValue} style={[styles.pillButton, {backgroundColor: tip === tipValue ? theme.colors.primary : theme.colors.surfaceVariant}]} onPress={() => { triggerHaptic(); setTip(tipValue);}}>
                                <Text style={{color: tip === tipValue ? '#FFFFFF' : theme.colors.onSurface}}>{tipValue === 0 ? 'No tip' : `₹${tipValue}`}</Text>
                             </TouchableOpacity>
                        ))}
                     </View>
                </GlassCard>
                <GlassCard style={{alignItems: 'flex-start', paddingVertical: 8}}>
                    <List.Section style={{width: '100%'}}>
                        <List.Subheader>Bill Details</List.Subheader>
                        <List.Item title="Item Total" titleStyle={{color: theme.colors.onSurface}} right={() => <Text style={{color: theme.colors.onSurfaceVariant}}>₹{cartTotal.toFixed(2)}</Text>} />
                        <List.Item title="Delivery Fee" titleStyle={{color: theme.colors.onSurface}} right={() => (
                            cartTotal > 300 ? (
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant}}>₹{originalDeliveryFee.toFixed(2)}</Text>
                                    <Text style={{marginLeft: 8, color: 'green', fontWeight: 'bold'}}>FREE</Text>
                                </View>
                            ) : (<Text style={{color: theme.colors.onSurfaceVariant}}>₹{deliveryFee.toFixed(2)}</Text>)
                        )} />
                        <List.Item title="Convenience Fee" titleStyle={{color: theme.colors.onSurface}} right={() => <Text style={{color: theme.colors.onSurfaceVariant}}>₹{convenienceFee.toFixed(2)}</Text>} />
                        <List.Item title="GST (18%)" titleStyle={{color: theme.colors.onSurface}} right={() => <Text style={{color: theme.colors.onSurfaceVariant}}>₹{taxes.toFixed(2)}</Text>} />
                         <List.Item title="Tip" titleStyle={{color: theme.colors.onSurface}} right={() => <Text style={{color: theme.colors.onSurfaceVariant}}>₹{tip.toFixed(2)}</Text>} />
                        <Divider style={{marginVertical: 8}}/>
                        <List.Item titleStyle={{fontWeight: 'bold', color: theme.colors.onSurface}} title="Grand Total" right={() => <Text style={{fontWeight: 'bold', color: theme.colors.onSurface}}>₹{grandTotal.toFixed(2)}</Text>} />
                    </List.Section>
                </GlassCard>
                <GlassCard style={{alignItems: 'flex-start', paddingVertical: 8}}>
                    <RadioButton.Group onValueChange={newValue => setPaymentMethod(newValue)} value={paymentMethod}>
                        <List.Section style={{width: '100%'}}>
                            <List.Subheader>Payment Method</List.Subheader>
                            <Pressable onPress={() => setPaymentMethod('upi')}>
                                <List.Item title="UPI" titleStyle={{color: theme.colors.onSurface}} left={() => <RadioButton value="upi" />} />
                            </Pressable>
                            <Pressable onPress={() => setPaymentMethod('card')}>
                                <List.Item title="Credit/Debit Card" titleStyle={{color: theme.colors.onSurface}} left={() => <RadioButton value="card" />} />
                            </Pressable>
                            <Pressable onPress={() => setPaymentMethod('cod')}>
                                <List.Item title="Cash on Delivery" titleStyle={{color: theme.colors.onSurface}} left={() => <RadioButton value="cod" />} />
                            </Pressable>
                        </List.Section>
                    </RadioButton.Group>
                </GlassCard>
            </ScrollView>
            <View style={[styles.footer, {backgroundColor: theme.colors.surface}]}>
                <GlassButton title={`Place Order (₹${grandTotal.toFixed(2)})`} onPress={handlePlaceOrder}/>
            </View>
        </AppBackground>
    )
}

export const OrderConfirmationScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { lastOrder } = useCart();
    
    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },[]);

    return(
        <AppBackground>
            <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={true} fadeOut={true} explosionSpeed={400} />
            <View style={styles.confirmationContainer}>
                <MaterialCommunityIcons name="check-decagram" size={100} color={theme.dark ? theme.colors.primary : '#4CAF50'} />
                <Text variant="headlineMedium" style={{color: theme.colors.onSurface, marginTop: 24, textAlign: 'center'}}>Order Placed Successfully!</Text>
                <Text variant="bodyLarge" style={{color: theme.colors.onSurfaceVariant, marginTop: 8}}>Order ID: {lastOrder?.id}</Text>
                <Text variant="titleMedium" style={{color: theme.colors.onSurface, marginTop: 24}}>Estimated Delivery by {lastOrder?.deliveryTime}</Text>
                <View style={{position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: 24}}>
                    <GlassButton title="Back to Home" onPress={() => navigation.popToTop()}/>
                </View>
            </View>
        </AppBackground>
    )
}

export const AddressListScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { addresses, selectedAddress, selectAddress, deleteAddress, defaultAddressId, makeDefaultAddress } = useUser();
    const [menuVisibleId, setMenuVisibleId] = useState(null);

    return (
        <AppBackground>
            <FlatList
                data={addresses}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <GlassCard style={{padding: 0, overflow: 'hidden'}}>
                        <Pressable onPress={() => { selectAddress(item.id); navigation.goBack();}} style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingTop: 16, paddingBottom: 16}}>
                            <RadioButton.Android value={item.id} status={selectedAddress?.id === item.id ? 'checked' : 'unchecked'} onPress={() => { selectAddress(item.id); navigation.goBack();}} />
                            <View style={{flex: 1, marginLeft: 8}}>
                                <Text variant="titleMedium" style={{color: theme.colors.onSurface}}>{item.type}</Text>
                                <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{`${item.line1}, ${item.line2}`}</Text>
                            </View>
                            {item.id !== 'current_location' && (
                                <Menu
                                    visible={menuVisibleId === item.id}
                                    onDismiss={() => setMenuVisibleId(null)}
                                    anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisibleId(item.id)} />}>
                                    <Menu.Item onPress={() => {setMenuVisibleId(null); navigation.navigate('DeliveryDetails', { address: item });}} title="Edit" />
                                    <Menu.Item onPress={() => {setMenuVisibleId(null); deleteAddress(item.id);}} title="Delete" />
                                </Menu>
                            )}
                        </Pressable>
                        {defaultAddressId === item.id && <Chip icon="check" style={{alignSelf: 'flex-start', marginLeft: 16, marginBottom: 16, backgroundColor: theme.colors.primaryContainer}} textStyle={{color: theme.colors.onPrimaryContainer}}>Default</Chip>}
                         {item.id !== 'current_location' && defaultAddressId !== item.id && (
                             <Card.Actions>
                                <Button onPress={() => makeDefaultAddress(item.id)}>Set as Default</Button>
                             </Card.Actions>
                        )}
                    </GlassCard>
                )}
                ListHeaderComponent={
                    <View style={{paddingHorizontal: 16, marginBottom: 16}}>
                        <GlassButton title="Add New Address" icon="plus" onPress={() => navigation.navigate('DeliveryDetails')} />
                    </View>
                }
                contentContainerStyle={{paddingTop: 16, paddingBottom: 40, paddingHorizontal: 16}}
            />
        </AppBackground>
    )
};

export const DeliveryDetailsScreen = ({ route, navigation }) => {
    const { theme } = useAppTheme();
    const { addAddress, updateAddress, selectAddress, selectedAddress } = useUser();
    const existingAddress = route.params?.address;

    const [type, setType] = useState(existingAddress?.type || 'Home');
    const [line1, setLine1] = useState(existingAddress?.line1 || '');
    const [line2, setLine2] = useState(existingAddress?.line2 || '');
    const [pincode, setPincode] = useState(existingAddress?.pincode || '');
    const [submitted, setSubmitted] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [flatNumber, setFlatNumber] = useState('');

    const isFormValid = line1.trim() !== '' && line2.trim() !== '' && pincode.trim() !== '';

    const handleSave = () => {
        setSubmitted(true);
        if (isFormValid) {
            const addressData = { type, line1, line2, pincode };
            if(existingAddress) {
                updateAddress({ ...existingAddress, ...addressData });
            } else {
                addAddress(addressData);
            }
            navigation.goBack();
        }
    };

    const handleConfirmCurrentLocation = () => {
        if (flatNumber.trim()) {
            const newAddress = {
                type: 'Home',
                line1: `${flatNumber}, ${selectedAddress.line1}`,
                line2: selectedAddress.line2,
                pincode: selectedAddress.line2.match(/\d{6}$/)?.[0] || ''
            };
            addAddress(newAddress);
            setModalVisible(false);
            navigation.goBack();
        }
    };
    
    return (
        <AppBackground>
             <Modal transparent visible={isModalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <BlurView intensity={50} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                        <Pressable>
                            <GlassCard style={[styles.popupContainer, { backgroundColor: theme.colors.surface }]}>
                                <Text style={[styles.popupTitle, {color: theme.colors.onSurface}]}>Enter Details</Text>
                                <Text style={[styles.popupText, {color: theme.colors.onSurfaceVariant}]}>Please enter your Flat / House No. to complete the address.</Text>
                                <GlassInput label="Flat/House No." value={flatNumber} onChangeText={setFlatNumber} />
                                <View style={{height: 24}}/>
                                <GlassButton title="Save Address" onPress={handleConfirmCurrentLocation} disabled={!flatNumber.trim()} style={{width: '100%'}}/>
                            </GlassCard>
                        </Pressable>
                    </Pressable>
                </BlurView>
            </Modal>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
            <ScrollView contentContainerStyle={{paddingHorizontal: 16, paddingTop: 16}}>
                <GlassCard style={{alignItems: 'flex-start'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                         <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
                         <View style={{marginLeft: 16, flex: 1}}>
                            <Text variant="bodyLarge" style={{fontWeight: 'bold', color: theme.colors.onSurface}}>Current Location</Text>
                            <Text style={{color: theme.colors.onSurfaceVariant}}>{selectedAddress?.line1}</Text>
                         </View>
                    </View>
                    <Button 
                        mode="contained" 
                        style={{width: '100%', marginTop: 16}} 
                        onPress={() => setModalVisible(true)}>
                        Confirm Location & Proceed
                    </Button>
                </GlassCard>
                <Text style={{textAlign: 'center', marginVertical: 16, color: theme.colors.onSurfaceVariant}}>OR ENTER MANUALLY</Text>
                <GlassCard>
                    <GlassInput label="House No. & Building Name" value={line1} onChangeText={setLine1} />
                    {submitted && !line1.trim() && <Text style={styles.errorText}>This field is required</Text>}
                    <View style={{height: 24}}/>
                    <GlassInput label="Road Name, Area, Colony" value={line2} onChangeText={setLine2} />
                     {submitted && !line2.trim() && <Text style={styles.errorText}>This field is required</Text>}
                    <View style={{height: 24}}/>
                    <GlassInput label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" />
                     {submitted && !pincode.trim() && <Text style={styles.errorText}>This field is required</Text>}
                    <View style={{width: '100%', marginTop: 24}}>
                         <RadioButton.Group onValueChange={newValue => setType(newValue)} value={type}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="Home" /><Text style={{color: theme.colors.onSurface}}>Home</Text></View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="Work" /><Text style={{color: theme.colors.onSurface}}>Work</Text></View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="other" /><Text style={{color: theme.colors.onSurface}}>Other</Text></View>
                            </View>
                         </RadioButton.Group>
                    </View>
                </GlassCard>
                <GlassButton title="Save Address" onPress={handleSave} disabled={!isFormValid && submitted} />
                <View style={{height: 40}}/>
            </ScrollView>
            </KeyboardAvoidingView>
        </AppBackground>
    )
};

export const PlaceholderScreen = ({route}) => {
    const { theme } = useAppTheme();
    return (
        <AppBackground>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{color: theme.colors.onSurface}}>{route.name}</Text>
            </View>
        </AppBackground>
    );
}

export const MyCollectionsScreen = ({navigation}) => {
    const { theme } = useAppTheme();
    const { favorites } = useUser();
    const favoriteRestaurants = useMemo(() => ALL_RESTAURANTS.filter(r => favorites.includes(r.id)), [favorites]);

    return (
        <AppBackground>
            <FlatList
                data={favoriteRestaurants}
                keyExtractor={(item) => item.id}
                renderItem={({item, index}) => <BigRestaurantCard restaurant={item} theme={theme} navigation={navigation} index={index} />}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: theme.colors.onSurface}}>You haven't added any restaurants to your collection yet.</Text>}
                contentContainerStyle={{paddingTop: 16, paddingBottom: 40}}
            />
        </AppBackground>
    )
};

export const PastOrdersScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { pastOrders } = useCart();

    return(
        <AppBackground>
            <FlatList
                data={pastOrders}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <GlassCard style={{padding: 16, marginHorizontal: 16, marginBottom: 16, alignItems: 'flex-start'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                            <Text variant="titleMedium" style={{fontWeight: 'bold', color: theme.colors.onSurface, flex: 1, flexShrink: 1, marginRight: 8}}>Order {item.id}</Text>
                            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{item.date}</Text>
                        </View>
                        <Divider style={{marginVertical: 12, width: '100%'}}/>
                        {item.items.map(dish => (
                            <View key={dish.id} style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4}}>
                                <Text style={{color: theme.colors.onSurface, flex: 1, flexShrink: 1, marginRight: 8}}>{dish.name} x {dish.quantity}</Text>
                                <Text style={{color: theme.colors.onSurfaceVariant}}>₹{dish.price * dish.quantity}</Text>
                            </View>
                        ))}
                         <Divider style={{marginVertical: 12, width: '100%'}}/>
                         <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                            <Text variant="titleMedium" style={{fontWeight: 'bold', color: theme.colors.onSurface}}>Total Paid</Text>
                            <Text variant="titleMedium" style={{fontWeight: 'bold', color: theme.colors.onSurface}}>₹{item.total.toFixed(2)}</Text>
                        </View>
                    </GlassCard>
                )}
                ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><Text style={{color: theme.colors.onSurface, fontSize: 16}}>No past orders found.</Text></View>}
                contentContainerStyle={{paddingTop: 16, paddingBottom: 40}}
            />
        </AppBackground>
    )
}

export const SettingsScreen = ({ navigation }) => {
    const { theme, themeMode, setThemeMode } = useAppTheme();
    const { user, setUser, resetApp } = useUser();
    const { isVegOnly, setIsVegOnly } = useSettings();
    const [versionClicks, setVersionClicks] = useState(0);
    
    const handleLogout = () => {
        setUser(null);
        navigation.getParent()?.navigate('Auth');
    };

    const toggleTheme = (isDark) => {
        setThemeMode(isDark ? 'dark' : 'light');
    };

    const handleVersionClick = () => {
        const newClicks = versionClicks + 1;
        setVersionClicks(newClicks);
        if (newClicks >= 5) {
            Alert.alert(
                "Reset App?",
                "Are you sure you want to clear all app data? This cannot be undone.",
                [
                    { text: "Cancel", style: "cancel", onPress: () => setVersionClicks(0) },
                    { text: "Reset", style: "destructive", onPress: () => {
                        resetApp();
                        setVersionClicks(0);
                    }}
                ]
            );
        }
    }
    
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16}}>
                 <GlassCard style={{marginBottom: 16, padding: 0, overflow: 'hidden'}}>
                    <List.Section style={{width: '100%', marginTop: 0}}>
                        <List.Subheader style={{color: theme.colors.onSurfaceVariant, paddingHorizontal: 16}}>Profile</List.Subheader>
                        <Pressable onPress={() => navigation.navigate('Profile')}>
                            <List.Item title={user?.name || "Guest User"} description={user?.email || "No email"} left={() => <List.Icon icon="account-circle" color={theme.colors.onSurface} />} titleStyle={{color: theme.colors.onSurface}} descriptionStyle={{color: theme.colors.onSurfaceVariant}} style={{paddingHorizontal: 16}}/>
                        </Pressable>
                    </List.Section>
                </GlassCard>

                <GlassCard style={{marginBottom: 16, padding: 0, overflow: 'hidden'}}>
                    <List.Section style={{width: '100%', marginTop: 0}}>
                        <List.Subheader style={{color: theme.colors.onSurfaceVariant, paddingHorizontal: 16}}>Preferences</List.Subheader>
                        <List.Item title="Enable Dark Mode" left={() => <List.Icon icon="theme-light-dark" color={theme.colors.onSurface}/>} right={() => <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} />} titleStyle={{color: theme.colors.onSurface}} style={{paddingHorizontal: 16}}/>
                        <List.Item title="Veg Mode" left={() => <List.Icon icon="leaf" color={theme.colors.onSurface}/>} right={() => <Switch value={isVegOnly} onValueChange={setIsVegOnly} />} titleStyle={{color: theme.colors.onSurface}} style={{paddingHorizontal: 16}}/>
                    </List.Section>
                </GlassCard>
                
                <GlassCard style={{marginBottom: 16, padding: 0, overflow: 'hidden'}}>
                    <List.Section style={{width: '100%', marginTop: 0}}>
                        <List.Subheader style={{color: theme.colors.onSurfaceVariant, paddingHorizontal: 16}}>My Account</List.Subheader>
                        <List.Item title="My Collections" left={() => <List.Icon icon="heart" color={theme.colors.onSurface}/>} onPress={() => navigation.navigate('MyCollections')} titleStyle={{color: theme.colors.onSurface}} style={{paddingHorizontal: 16}}/>
                        <List.Item title="My Past Orders" left={() => <List.Icon icon="history" color={theme.colors.onSurface}/>} onPress={() => navigation.navigate('PastOrders')} titleStyle={{color: theme.colors.onSurface}} style={{paddingHorizontal: 16}}/>
                        <List.Item title="My Addresses" left={() => <List.Icon icon="map-marker" color={theme.colors.onSurface}/>} onPress={() => navigation.navigate('MyAddresses')} titleStyle={{color: theme.colors.onSurface}} style={{paddingHorizontal: 16}}/>
                    </List.Section>
                </GlassCard>
                
                <GlassButton title="Log Out" onPress={handleLogout} />

                <TouchableOpacity onPress={handleVersionClick}>
                    <View style={{alignItems: 'center', paddingVertical: 20}}>
                        <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
                            Version 0.5.6
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export const ProfileScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { user, updateUserProfile } = useUser();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dob, setDob] = useState(user?.dob || '');
    const [anniversary, setAnniversary] = useState(user?.anniversary || '');
    const [gender, setGender] = useState(user?.gender || 'male');
    const [imageUri, setImageUri] = useState(user?.pfp || null);

    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isDobValid, setIsDobValid] = useState(true);
    const [isAnniversaryValid, setIsAnniversaryValid] = useState(true);

    const validateFormat = (text, regex) => {
        if (!text || text.length === 0) return true;
        return regex.test(text);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailValid(validateFormat(text, /\S+@\S+\.\S+/));
    };

    const handleDobChange = (text) => {
        setDob(text);
        setIsDobValid(validateFormat(text, /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/));
    };

    const handleAnniversaryChange = (text) => {
        setAnniversary(text);
        setIsAnniversaryValid(validateFormat(text, /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/));
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if(name.trim() === '' || phone.trim() === '') {
            Alert.alert("Validation Error", "Name and Phone Number are required.");
            return;
        }
        if (!isEmailValid || !isDobValid || !isAnniversaryValid) {
            Alert.alert("Validation Error", "Please fix the errors before saving.");
            return;
        }
        updateUserProfile({ name, phone, email, dob, anniversary, gender, pfp: imageUri });
        navigation.goBack();
    };

    return (
        <AppBackground>
            <ScrollView contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40}}>
                <View style={{alignItems: 'center', marginVertical: 24}}>
                    {imageUri ? (
                        <Avatar.Image size={100} source={{ uri: imageUri }} />
                    ) : (
                        <Avatar.Text size={100} label={name ? name.charAt(0).toUpperCase() : 'G'} />
                    )}
                    <Button onPress={pickImage}>Edit Picture</Button>
                </View>
                <GlassCard>
                    <GlassInput label="Name (Required)" value={name} onChangeText={setName} hideLabelInDarkMode />
                    <View style={{height: 24}}/>
                    <GlassInput 
                        label="Phone (Required)" 
                        value={phone} 
                        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))} 
                        keyboardType="phone-pad"
                        hideLabelInDarkMode 
                    />
                    <View style={{height: 24}}/>
                    <GlassInput label="Email" value={email} onChangeText={handleEmailChange} keyboardType="email-address" error={!isEmailValid} />
                    {!isEmailValid && <Text style={styles.errorText}>Please enter a valid email.</Text>}
                    <View style={{height: 24}}/>
                    <GlassInput label="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={handleDobChange} error={!isDobValid} />
                    {!isDobValid && <Text style={styles.errorText}>Use DD/MM/YYYY format.</Text>}
                    <View style={{height: 24}}/>
                    <GlassInput label="Anniversary (DD/MM/YYYY)" value={anniversary} onChangeText={handleAnniversaryChange} error={!isAnniversaryValid} />
                    {!isAnniversaryValid && <Text style={styles.errorText}>Use DD/MM/YYYY format.</Text>}
                    
                    <View style={{width: '100%', marginTop: 24}}>
                        <Text variant="bodyLarge" style={{color: theme.colors.onSurface}}>Gender</Text>
                         <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 8}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="male" /><Text style={{color: theme.colors.onSurface}}>Male</Text></View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="female" /><Text style={{color: theme.colors.onSurface}}>Female</Text></View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}><RadioButton value="other" /><Text style={{color: theme.colors.onSurface}}>Other</Text></View>
                            </View>
                         </RadioButton.Group>
                    </View>
                </GlassCard>
                <GlassButton title="Save Profile" onPress={handleSave} />
            </ScrollView>
        </AppBackground>
    )
};

export const SearchScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('restaurant');

    const segmentedButtonsTheme = useMemo(() => ({
        ...theme,
        colors: {
            ...theme.colors,
            secondaryContainer: theme.colors.primary,
            onSecondaryContainer: theme.dark ? theme.colors.onSurface : '#FFFFFF',
        }
    }), [theme]);

    const allDishes = useMemo(() => {
        return ALL_RESTAURANTS.flatMap(restaurant => 
            restaurant.menu.map(dish => ({
                ...dish,
                restaurantName: restaurant.name,
                restaurantImage: restaurant.image,
                parentRestaurant: restaurant
            }))
        );
    }, []);

    const filteredRestaurants = useMemo(() => {
        if (!searchQuery) return [];
        return ALL_RESTAURANTS.filter(res => res.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    const filteredDishes = useMemo(() => {
        if (!searchQuery) return [];
        return allDishes.filter(dish => dish.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, allDishes]);

    const renderSearchResult = ({ item }) => {
        if (searchType === 'restaurant') {
            return <BigRestaurantCard restaurant={item} theme={theme} navigation={navigation} index={0} />;
        }
        return <MenuItemCard item={item} restaurant={item.parentRestaurant} />;
    };

    return(
        <AppBackground>
            <View style={{flex: 1, paddingTop: insets.top}}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8}}>
                    <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
                    <Searchbar 
                        placeholder={searchType === 'restaurant' ? 'Search for restaurants' : 'Search for dishes'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{flex: 1}}
                        autoFocus
                    />
                </View>
                <View style={{padding: 16}}>
                    <SegmentedButtons
                        value={searchType}
                        onValueChange={setSearchType}
                        theme={segmentedButtonsTheme}
                        buttons={[
                            { value: 'restaurant', label: 'Restaurants' },
                            { value: 'dish', label: 'Dishes' },
                        ]}
                    />
                </View>
                <FlatList
                    data={searchType === 'restaurant' ? filteredRestaurants : filteredDishes}
                    keyExtractor={(item, index) => item.id + index.toString()}
                    renderItem={renderSearchResult}
                    ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 40}}>No results found.</Text>}
                />
            </View>
        </AppBackground>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 5 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 10, marginBottom: 16 },
    searchBar: { flex: 1, borderRadius: 30 },
    searchBarLight: { backgroundColor: 'rgba(255, 255, 255, 0.6)'},
    searchBarDark: { backgroundColor: 'rgba(255, 255, 255, 0.1)'},
    vegToggleContainer: { alignItems: 'center', marginLeft: 16 },
    banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, padding: 16, borderRadius: 20, marginBottom: 16 },
    networkBanner: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginHorizontal: 16, 
        padding: 12, 
        borderRadius: 12, 
        marginBottom: 16 
    },
    categoryItem: { alignItems: 'center', marginRight: 20 },
    categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    moodItem: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 12 },
    authContainer: { flex: 1 },
    authContent: { flex: 1, alignItems: 'center', padding: 20 },
    stageContainer: { flex: 1, width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 30},
    appNameTitle: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
    stageTitle: { fontSize: 32, fontWeight: '600', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
    authTitle: { fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    authSubtitle: { textAlign: 'center', opacity: 0.9, fontSize: 16 },
    countryCodeButton: { height: 56, width: 60, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8},
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
    popupContainer: { width: '100%', padding: 20, borderRadius: 20, overflow: 'hidden' },
    popupTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    popupText: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    backButton: { position: 'absolute', left: 10, zIndex: 1, padding: 10 },
    errorText: { color: 'red', width: '100%', paddingHorizontal: 4, marginTop: 4},
    ratingBox: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
    pillButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
    menuItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1},
    cartItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, marginBottom: 12, borderRadius: 12, borderWidth: 1},
    quantityContainer: {flexDirection: 'row', alignItems: 'center', borderRadius: 8, height: 42, width: 110, justifyContent: 'space-between'},
    addButton: { borderRadius: 8, height: 42, justifyContent: 'center', alignItems: 'center', width: 110},
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 8, borderTopWidth: 1, borderColor: 'rgba(128,128,128,0.2)'},
    confirmationContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
    profileInput: {width: '100%', marginBottom: 16}
});