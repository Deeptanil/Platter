import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text as RNText, ScrollView, TouchableOpacity, FlatList, Image, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Modal, SafeAreaView, Alert, TouchableWithoutFeedback, Keyboard, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Searchbar, Switch, Avatar, List, Divider, Button, Checkbox, Card, IconButton, RadioButton, SegmentedButtons, Menu, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppTheme, useSettings, useUser, useCart } from './context';
import { BigRestaurantCard, RecommendedCard, CartFAB, GlassCard, GlassInput, AppBackground, GlassButton } from './components';
import { ALL_RESTAURANTS, CATEGORIES, MOODS } from './data';

const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export const AuthScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { setUser } = useUser();
    const [stage, setStage] = useState('welcome');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
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
                                <Text style={[styles.popupText, {color: theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant}]}>Platter is currently available in Mumbai only.</Text>
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
                                        <Text style={[styles.appNameTitle, { color: theme.colors.primary, letterSpacing: 2 }]}>Platter</Text>
                                    </Animated.View>
                                    <Animated.View style={[{width: '100%'}, animatedCardStyle]}>
                                        <GlassCard>
                                            <Text variant="headlineLarge" style={[styles.authTitle, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface }]}>Welcome to Platter</Text>
                                            <Text variant="bodyLarge" style={[styles.authSubtitle, { color: theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant }]}>Mumbai's hunger, delivered.</Text>
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
    { id: 'b1', title: 'MEALS UNDER', highlight: '₹250', subtitle: 'Budget-friendly picks near you', gradColors: ['#0F2027', '#203A43', '#2C5364'], accent: '#00E676', icon: 'food-variant' },
    { id: 'b2', title: 'FREE DELIVERY', highlight: 'Above ₹299', subtitle: 'Every restaurant, every order', gradColors: ['#1a0038', '#4a0072', '#7B1FA2'], accent: '#CE93D8', icon: 'bike-fast' },
    { id: 'b3', title: 'LATE NIGHT', highlight: 'SPECIALS', subtitle: 'Open past midnight just for you', gradColors: ['#1a0800', '#7f3b00', '#bf360c'], accent: '#FFAB40', icon: 'moon-waning-crescent' },
];

const HomeBannerCarousel = ({ theme }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const BANNER_WIDTH = SCREEN_WIDTH - 40;
    const GAP = 12;
    const INTERVAL = BANNER_WIDTH + GAP;

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => {
                const next = (prev + 1) % BANNERS.length;
                scrollRef.current?.scrollTo({ x: next * INTERVAL, animated: true });
                return next;
            });
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ marginBottom: 12 }}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={INTERVAL}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 16, gap: GAP }}
                onMomentumScrollEnd={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / INTERVAL))}
            >
                {BANNERS.map(b => (
                    <LinearGradient
                        key={b.id}
                        colors={b.gradColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[homeStyles.bannerSlide, { width: BANNER_WIDTH }]}
                    >
                        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={homeStyles.bannerTextBlock}>
                            <RNText style={homeStyles.bannerTitle}>{b.title}</RNText>
                            <RNText style={[homeStyles.bannerHighlight, { color: b.accent }]}>{b.highlight}</RNText>
                            <RNText style={homeStyles.bannerSub}>{b.subtitle}</RNText>
                            <View style={[homeStyles.bannerBtn, { borderColor: b.accent + '80' }]}>
                                <RNText style={[homeStyles.bannerBtnText, { color: b.accent }]}>Explore</RNText>
                                <MaterialCommunityIcons name="arrow-right" size={13} color={b.accent} />
                            </View>
                        </View>
                        <View style={[homeStyles.bannerIconCircle, { backgroundColor: b.accent + '18' }]}>
                            <MaterialCommunityIcons name={b.icon} size={52} color={b.accent} />
                        </View>
                    </LinearGradient>
                ))}
            </ScrollView>
            <View style={homeStyles.dotsRow}>
                {BANNERS.map((_, i) => (
                    <View key={i} style={[
                        homeStyles.dot,
                        { width: i === activeIndex ? 20 : 6, backgroundColor: i === activeIndex ? theme.colors.primary : (theme.dark ? 'rgba(255,255,255,0.25)' : 'rgba(108,59,245,0.25)') }
                    ]} />
                ))}
            </View>
        </View>
    );
};

const SORT_OPTIONS = [
    { key: 'default', label: 'Best', icon: 'thumb-up' },
    { key: 'rating', label: 'Top Rated', icon: 'star-circle' },
    { key: 'delivery', label: 'Fastest Delivery', icon: 'clock-fast' },
    { key: 'distance', label: 'Nearest First', icon: 'map-marker' },
];

const FILTER_CHIPS = ['Gourmet', 'No packaging charges', 'New to you', 'Fastest delivery'];

const HomeScreenHeader = ({ navigation, theme, isVegOnly, setIsVegOnly, selectedCategory, setSelectedCategory, netInfo, sortOption, setSortOption, activeChip, setActiveChip, filterMode }) => {
    const { user, selectedAddress } = useUser();
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

    return (
        <>
            {/* Frosted top bar */}
            <BlurView
                intensity={theme.dark ? 55 : 70}
                tint={theme.dark ? 'dark' : 'light'}
                style={[homeStyles.topBar, {
                    borderBottomColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(108,59,245,0.1)',
                    backgroundColor: theme.dark ? 'rgba(13,11,30,0.5)' : 'rgba(255,255,255,0.45)',
                }]}
            >
                <TouchableOpacity onPress={() => navigation.navigate('MyAddresses')} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                        <RNText style={[homeStyles.topBarLocation, { color: theme.colors.onSurface }]}>Home</RNText>
                        <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.primary} />
                    </View>
                    <RNText style={[homeStyles.topBarAddress, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                        {selectedAddress?.line1 || 'Mumbai, Maharashtra'}
                    </RNText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[homeStyles.avatarBtn, { backgroundColor: theme.colors.primary }]}>
                    <RNText style={homeStyles.avatarLabel}>{userInitial}</RNText>
                </TouchableOpacity>
            </BlurView>

            {/* Pill search bar + VEG toggle */}
            <View style={homeStyles.searchRow}>
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={homeStyles.searchBox} activeOpacity={0.85}>
                    <BlurView intensity={theme.dark ? 30 : 50} tint={theme.dark ? 'dark' : 'light'}
                        style={[homeStyles.searchInner, {
                            borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(108,59,245,0.18)',
                            backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                        }]}
                    >
                        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.primary} />
                        <RNText style={[homeStyles.searchPlaceholder, { color: theme.colors.onSurfaceVariant }]}>Search restaurants or dishes</RNText>
                    </BlurView>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setIsVegOnly(v => !v)}
                    style={[homeStyles.vegToggle, { backgroundColor: isVegOnly ? '#22C55E' : (theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), borderColor: isVegOnly ? '#22C55E' : (theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)') }]}
                >
                    <MaterialCommunityIcons name={isVegOnly ? 'leaf' : 'leaf-off'} size={18} color={isVegOnly ? '#FFF' : '#22C55E'} />
                </TouchableOpacity>
            </View>

            {/* Offline banner */}
            {netInfo?.isInternetReachable === false && (
                <BlurView intensity={theme.dark ? 30 : 40} tint={theme.dark ? 'dark' : 'light'}
                    style={[homeStyles.offlineBanner, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                    <MaterialCommunityIcons name="wifi-off" color="#FF9800" size={16} />
                    <RNText style={{ color: theme.dark ? '#FFF' : theme.colors.onSurface, marginLeft: 8, fontSize: 13 }}>You are offline.</RNText>
                </BlurView>
            )}

            {/* Hero Banner Carousel */}
            <HomeBannerCarousel theme={theme} />

            {/* Frosted glass category scroller */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.categoryScroll}>
                {CATEGORIES.map(item => {
                    const isActive = selectedCategory === item.name;
                    return (
                        <TouchableOpacity key={item.name} style={homeStyles.categoryItem} onPress={() => setSelectedCategory(item.name)} activeOpacity={0.8}>
                            <BlurView intensity={theme.dark ? 30 : 45} tint={theme.dark ? 'dark' : 'light'}
                                style={[homeStyles.categoryImageWrap, {
                                    borderColor: isActive ? theme.colors.primary : 'transparent',
                                    borderWidth: isActive ? 2.5 : 0,
                                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)',
                                }]}
                            >
                                <Image source={{ uri: item.image }} style={homeStyles.categoryImage} />
                            </BlurView>
                            <RNText style={[homeStyles.categoryLabel, { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>{item.name}</RNText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Pill filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.chipsRow}>
                <BlurView intensity={theme.dark ? 25 : 40} tint={theme.dark ? 'dark' : 'light'}
                    style={[homeStyles.filterChip, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,245,0.06)' }]}>
                    <MaterialCommunityIcons name="tune-variant" size={13} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <RNText style={[homeStyles.chipLabel, { color: theme.colors.primary }]}>Filter</RNText>
                </BlurView>
                {FILTER_CHIPS.map(chip => (
                    <TouchableOpacity
                        key={chip}
                        onPress={() => { triggerHaptic(); setActiveChip(prev => prev === chip ? null : chip); }}
                        activeOpacity={0.8}
                    >
                        {activeChip === chip ? (
                            <LinearGradient
                                colors={['#8B5CF6', '#6C3BF5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={homeStyles.filterChip}
                            >
                                <RNText style={[homeStyles.chipLabel, { color: '#FFF' }]}>{chip}</RNText>
                            </LinearGradient>
                        ) : (
                            <BlurView intensity={theme.dark ? 25 : 40} tint={theme.dark ? 'dark' : 'light'}
                                style={[homeStyles.filterChip, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,245,0.06)' }]}>
                                <RNText style={[homeStyles.chipLabel, { color: theme.colors.onSurface }]}>{chip}</RNText>
                            </BlurView>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}>
                {SORT_OPTIONS.map(opt => (
                    <TouchableOpacity key={opt.key} onPress={() => { triggerHaptic(); setSortOption(opt.key); }} activeOpacity={0.8}>
                        {sortOption === opt.key ? (
                            <LinearGradient colors={['#8B5CF6', '#6C3BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={homeStyles.sortChip}>
                                <MaterialCommunityIcons name={opt.icon} size={13} color="#FFF" style={{ marginRight: 4 }} />
                                <RNText style={{ fontSize: 12, color: '#FFF', fontWeight: '600' }}>{opt.label}</RNText>
                            </LinearGradient>
                        ) : (
                            <BlurView intensity={theme.dark ? 25 : 40} tint={theme.dark ? 'dark' : 'light'}
                                style={[homeStyles.sortChip, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,245,0.06)' }]}>
                                <MaterialCommunityIcons name={opt.icon} size={13} color={theme.colors.onSurfaceVariant} style={{ marginRight: 4 }} />
                                <RNText style={{ fontSize: 12, color: theme.colors.onSurface }}>{opt.label}</RNText>
                            </BlurView>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Recommended section */}
            <RNText style={[homeStyles.sectionTitle, { color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(108,59,245,0.55)' }]}>RECOMMENDED FOR YOU</RNText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 12 }}
            >
                {ALL_RESTAURANTS.slice(0, 8).map(item => (
                    <RecommendedCard
                        key={item.id}
                        restaurant={item}
                        theme={theme}
                        navigation={navigation}
                    />
                ))}
            </ScrollView>

            <RNText style={[homeStyles.sectionTitle, { color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(108,59,245,0.55)', marginTop: 8 }]}>
                {filterMode === 'healthy' ? 'HEALTHY PLACES FOR YOU' : filterMode === 'under250' ? 'BUDGET BITES UNDER ₹250' : 'ALL RESTAURANTS'}
            </RNText>
        </>
    );
};

export const HomeScreen = ({ navigation, route }) => {
    const filterMode = route?.params?.filterMode || 'all';
    const { theme } = useAppTheme();
    const { isVegOnly, setIsVegOnly } = useSettings();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('default');
    const [activeChip, setActiveChip] = useState(null);
    const insets = useSafeAreaInsets();
    const netInfo = useNetInfo();

    const filteredRestaurants = useMemo(() => {
        let restaurants = ALL_RESTAURANTS;

        if (filterMode === 'under250') {
            restaurants = restaurants.filter(res => res.menu.some(item => item.price <= 250));
        } else if (filterMode === 'healthy') {
            restaurants = restaurants.filter(res => res.moods && res.moods.includes('healthy'));
        }

        if (isVegOnly) {
            restaurants = restaurants.filter(res => res.isVeg);
        }

        restaurants = restaurants.filter(res => {
            return selectedCategory === 'All' || res.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
        });

        if (activeChip) {
            if (activeChip === 'Gourmet') {
                restaurants = restaurants.filter(res => res.rating >= 4.6);
            } else if (activeChip === 'Fastest delivery') {
                restaurants = restaurants.filter(res => res.deliveryTime <= 25);
            } else if (activeChip === 'New to you') {
                restaurants = restaurants.filter(res => parseFloat(res.distance) <= 2.5);
            } else if (activeChip === 'No packaging charges') {
                // Mock filtering for packaging charges
                restaurants = restaurants.filter(res => res.id % 2 === 0);
            }
        }

        if (sortOption === 'rating') restaurants = [...restaurants].sort((a, b) => b.rating - a.rating);
        else if (sortOption === 'delivery') restaurants = [...restaurants].sort((a, b) => a.deliveryTime - b.deliveryTime);
        else if (sortOption === 'distance') {
            const parseDist = (str) => { const val = parseFloat(str); return isNaN(val) ? 999 : val; };
            restaurants = [...restaurants].sort((a, b) => parseDist(a.distance) - parseDist(b.distance));
        }

        return restaurants;
    }, [isVegOnly, selectedCategory, sortOption, filterMode, activeChip]);

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
                        netInfo={netInfo}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        activeChip={activeChip}
                        setActiveChip={setActiveChip}
                        filterMode={filterMode}
                    />
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 32 }}>
                        <BlurView intensity={30} tint={theme.dark ? 'dark' : 'light'} style={{ padding: 24, borderRadius: 32, borderWidth: 1, borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(108,59,245,0.15)', alignItems: 'center', backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)' }}>
                            <MaterialCommunityIcons name="silverware-fork-knife" size={52} color={theme.colors.primary} />
                            <RNText style={{ color: theme.colors.onSurface, marginTop: 14, textAlign: 'center', fontWeight: '600', fontSize: 16 }}>No restaurants found</RNText>
                            <RNText style={{ color: theme.colors.onSurfaceVariant, marginTop: 6, textAlign: 'center', fontSize: 13 }}>Try adjusting your filters</RNText>
                        </BlurView>
                    </View>
                }
                contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 160 }}
            />
            <CartFAB navigation={navigation} />
        </AppBackground>
    );
};

const MenuItemCard = ({ item, restaurant }) => {
    const { theme } = useAppTheme();
    const { cart, addToCart, removeFromCart } = useCart();
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <BlurView
            intensity={theme.dark ? 22 : 45}
            tint={theme.dark ? 'dark' : 'light'}
            style={[rdStyles.menuItem, {
                borderColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(108,59,245,0.1)',
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
            }]}
        >
            {/* Left content */}
            <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={[{ width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 6 }, { borderColor: item.isVeg ? '#22C55E' : '#EF4444' }]}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.isVeg ? '#22C55E' : '#EF4444' }} />
                    </View>
                    {item.isHighlyOrdered && (
                        <View style={[rdStyles.highlyOrderedBadge, { backgroundColor: '#FF6D0018' }]}>
                            <MaterialCommunityIcons name="trending-up" size={11} color="#FF6D00" />
                            <RNText style={rdStyles.highlyOrderedText}>Top pick</RNText>
                        </View>
                    )}
                </View>
                <RNText style={[rdStyles.menuItemName, { color: theme.colors.onSurface }]}>{item.name}</RNText>
                <RNText style={[rdStyles.menuItemPrice, { color: theme.colors.primary, fontWeight: '700' }]}>₹{item.price}</RNText>
                {item.isSpicy && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="fire" size={12} color="#FF5722" />
                        <RNText style={{ fontSize: 11, color: '#FF5722', marginLeft: 3, fontWeight: '600' }}>Spicy</RNText>
                    </View>
                )}
            </View>

            {/* Right: image + ADD button */}
            <View style={rdStyles.menuItemRight}>
                <View style={{ borderRadius: 14, overflow: 'hidden' }}>
                    <Image source={{ uri: restaurant.image }} style={rdStyles.menuItemImage} resizeMode="cover" />
                </View>
                <View style={rdStyles.menuItemAction}>
                    {quantity > 0 ? (
                        <LinearGradient colors={['#8B5CF6', '#6C3BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={rdStyles.qtyBox}>
                            <TouchableOpacity onPress={() => { triggerHaptic(); removeFromCart(item); }} style={rdStyles.qtyBtn}>
                                <MaterialCommunityIcons name="minus" size={14} color="#FFF" />
                            </TouchableOpacity>
                            <RNText style={rdStyles.qtyText}>{quantity}</RNText>
                            <TouchableOpacity onPress={() => { triggerHaptic(); addToCart({ ...item, restaurantName: restaurant.name }); }} style={rdStyles.qtyBtn}>
                                <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                            </TouchableOpacity>
                        </LinearGradient>
                    ) : (
                        <TouchableOpacity onPress={() => { triggerHaptic(); addToCart({ ...item, restaurantName: restaurant.name }); }} activeOpacity={0.85}>
                            <LinearGradient colors={['#8B5CF6', '#6C3BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={rdStyles.addBtn}>
                                <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                                <RNText style={rdStyles.addBtnText}>ADD</RNText>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </BlurView>
    );
};

export const RestaurantDetailsScreen = ({ navigation, route }) => {
    const { restaurant } = route.params;
    const { theme } = useAppTheme();
    const { cart } = useCart();
    const { pastOrders } = useCart();
    const [activeFilter, setActiveFilter] = useState('all');
    const [menuSearchQuery, setMenuSearchQuery] = useState('');
    const [showOffers, setShowOffers] = useState(false);
    const insets = useSafeAreaInsets();

    const hasNonVeg = restaurant.menu.some(item => !item.isVeg);

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#4CAF50';
        if (rating >= 3) return '#FF9800';
        return '#F44336';
    };

    const menuFilters = useMemo(() => {
        const filters = ['all', 'veg'];
        if (hasNonVeg) filters.push('non-veg');
        filters.push('spicy', 'highly ordered');
        return filters;
    }, [hasNonVeg]);

    // Past orders for this restaurant
    const pastOrderItems = useMemo(() => {
        const items = [];
        pastOrders.forEach(order => {
            order.items?.forEach(item => {
                if (item.restaurantName === restaurant.name && !items.find(i => i.id === item.id)) {
                    items.push(item);
                }
            });
        });
        return items.slice(0, 3);
    }, [pastOrders, restaurant.name]);

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

    const DUMMY_OFFERS = [
        `Flat ₹60 OFF above ₹299`,
        `20% OFF on first order`,
        `Free delivery on orders above ₹199`,
    ];

    return (
        <AppBackground>
            <FlatList
                data={flatFilteredMenu}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MenuItemCard item={item} restaurant={restaurant} />}
                ListHeaderComponent={() => (
                    <>
                        {/* Hero image with frosted back button */}
                        <View style={rdStyles.heroWrap}>
                            <Image source={{ uri: restaurant.image }} style={rdStyles.heroImage} resizeMode="cover" />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.6)']}
                                locations={[0, 0.4, 1]}
                                style={StyleSheet.absoluteFill}
                            />
                            <TouchableOpacity
                                style={[rdStyles.backBtn, { top: insets.top + 8 }]}
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.85}
                            >
                                <BlurView intensity={60} tint="dark" style={rdStyles.backBtnBlur}>
                                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                                </BlurView>
                            </TouchableOpacity>
                        </View>

                        {/* Frosted glass info card */}
                        <BlurView
                            intensity={theme.dark ? 40 : 65}
                            tint={theme.dark ? 'dark' : 'light'}
                            style={[rdStyles.infoCard, {
                                borderBottomWidth: 1,
                                borderBottomColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(108,59,245,0.12)',
                                backgroundColor: theme.dark ? 'rgba(13,11,30,0.7)' : 'rgba(255,255,255,0.7)',
                            }]}
                        >
                            {/* Name + rating */}
                            <View style={rdStyles.nameRow}>
                                <RNText style={[rdStyles.restaurantName, { color: theme.colors.onSurface }]}>{restaurant.name}</RNText>
                                <LinearGradient
                                    colors={getRatingColor(restaurant.rating) === '#4CAF50' ? ['#22C55E', '#16A34A'] : getRatingColor(restaurant.rating) === '#FF9800' ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
                                    style={rdStyles.ratingBubble}
                                >
                                    <MaterialCommunityIcons name="star" size={12} color="#FFF" />
                                    <RNText style={rdStyles.ratingText}>{restaurant.rating}</RNText>
                                </LinearGradient>
                            </View>
                            <RNText style={[rdStyles.reviewCount, { color: theme.colors.onSurfaceVariant }]}>{restaurant.reviews} ratings</RNText>
                            <RNText style={[rdStyles.tagsLine, { color: theme.colors.onSurfaceVariant }]}>{restaurant.tags.join(' · ')}</RNText>

                            {/* Meta row */}
                            <View style={rdStyles.metaRow}>
                                <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={[rdStyles.metaPill, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(108,59,245,0.07)' }]}>
                                    <MaterialCommunityIcons name="clock-fast" size={13} color={theme.colors.primary} />
                                    <RNText style={[rdStyles.metaText, { color: theme.colors.onSurface, fontWeight: '600' }]}>{restaurant.deliveryTime} min</RNText>
                                </BlurView>
                                <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={[rdStyles.metaPill, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(108,59,245,0.07)', marginLeft: 8 }]}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={13} color={theme.colors.primary} />
                                    <RNText style={[rdStyles.metaText, { color: theme.colors.onSurface, fontWeight: '600' }]}>{restaurant.distance}</RNText>
                                </BlurView>
                                <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={[rdStyles.metaPill, { borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.15)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(108,59,245,0.07)', marginLeft: 8 }]}>
                                    <MaterialCommunityIcons name="leaf" size={13} color="#22C55E" />
                                    <RNText style={[rdStyles.metaText, { color: '#22C55E', fontWeight: '600' }]}>Eco</RNText>
                                </BlurView>
                            </View>

                            {/* Offer strip */}
                            <TouchableOpacity onPress={() => setShowOffers(v => !v)} activeOpacity={0.85}>
                                <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'}
                                    style={[rdStyles.offerStrip, { borderColor: theme.dark ? 'rgba(255,165,0,0.25)' : 'rgba(255,165,0,0.35)', backgroundColor: theme.dark ? 'rgba(255,165,0,0.08)' : 'rgba(255,252,235,0.9)' }]}>
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="tag" size={16} color={theme.colors.primary} />
                                    </View>
                                    <RNText style={[rdStyles.offerStripText, { color: theme.colors.onSurface }]}>{restaurant.offer || DUMMY_OFFERS[0]}</RNText>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <RNText style={[rdStyles.offerCountText, { color: theme.colors.primary }]}>{DUMMY_OFFERS.length}</RNText>
                                        <MaterialCommunityIcons name={showOffers ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.primary} />
                                    </View>
                                </BlurView>
                            </TouchableOpacity>

                            {showOffers && (
                                <View style={{ marginTop: 8, gap: 6 }}>
                                    {DUMMY_OFFERS.map((offer, i) => (
                                        <BlurView key={i} intensity={15} tint={theme.dark ? 'dark' : 'light'}
                                            style={[rdStyles.offerListItem, { borderColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(108,59,245,0.12)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(108,59,245,0.05)' }]}>
                                            <MaterialCommunityIcons name="ticket-percent" size={15} color={theme.colors.primary} />
                                            <RNText style={[rdStyles.offerListText, { color: theme.colors.onSurface }]}>{offer}</RNText>
                                        </BlurView>
                                    ))}
                                </View>
                            )}
                        </BlurView>

                        {/* Filter pills */}
                        <BlurView intensity={theme.dark ? 35 : 55} tint={theme.dark ? 'dark' : 'light'}
                            style={[rdStyles.filtersRow, { borderBottomColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(108,59,245,0.1)', backgroundColor: theme.dark ? 'rgba(13,11,30,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
                                {menuFilters.map(f => (
                                    <TouchableOpacity key={f} onPress={() => { triggerHaptic(); setActiveFilter(f); }} activeOpacity={0.8}>
                                        {activeFilter === f ? (
                                            <LinearGradient colors={['#8B5CF6', '#6C3BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={rdStyles.filterPill}>
                                                {f === 'veg' && <MaterialCommunityIcons name="leaf" size={12} color="#FFF" style={{ marginRight: 4 }} />}
                                                {f === 'non-veg' && <MaterialCommunityIcons name="food-drumstick" size={12} color="#FFF" style={{ marginRight: 4 }} />}
                                                {f === 'highly ordered' && <MaterialCommunityIcons name="trending-up" size={12} color="#FFF" style={{ marginRight: 4 }} />}
                                                <RNText style={[rdStyles.filterPillText, { color: '#FFF' }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</RNText>
                                            </LinearGradient>
                                        ) : (
                                            <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'}
                                                style={[rdStyles.filterPill, { borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(108,59,245,0.18)', backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)' }]}>
                                                {f === 'veg' && <MaterialCommunityIcons name="leaf" size={12} color="#22C55E" style={{ marginRight: 4 }} />}
                                                {f === 'non-veg' && <MaterialCommunityIcons name="food-drumstick" size={12} color="#EF4444" style={{ marginRight: 4 }} />}
                                                {f === 'highly ordered' && <MaterialCommunityIcons name="trending-up" size={12} color="#FF6D00" style={{ marginRight: 4 }} />}
                                                <RNText style={[rdStyles.filterPillText, { color: theme.colors.onSurface }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</RNText>
                                            </BlurView>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </BlurView>

                        {/* Search in menu */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                            <BlurView intensity={theme.dark ? 25 : 50} tint={theme.dark ? 'dark' : 'light'}
                                style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(108,59,245,0.18)', paddingHorizontal: 14, paddingVertical: 12, gap: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)', overflow: 'hidden' }}>
                                <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.primary} />
                                <TextInput
                                    placeholder="Search in menu..."
                                    value={menuSearchQuery}
                                    onChangeText={setMenuSearchQuery}
                                    style={{ flex: 1, fontSize: 14, color: theme.colors.onSurface, backgroundColor: 'transparent', paddingVertical: 0, height: 22 }}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                />
                            </BlurView>
                        </View>

                        {/* Past orders section */}
                        {pastOrderItems.length > 0 && (
                            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                                <RNText style={[rdStyles.sectionHeading, { color: theme.colors.onSurface, marginBottom: 4 }]}>Your Orders</RNText>
                                <RNText style={[rdStyles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>Past customisations pre-selected</RNText>
                                {pastOrderItems.map(item => (
                                    <PastOrderItem key={item.id} item={item} restaurant={restaurant} theme={theme} />
                                ))}
                            </View>
                        )}

                        <RNText style={[rdStyles.sectionHeading, { color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(108,59,245,0.55)', paddingHorizontal: 16, paddingVertical: 10, fontSize: 12, letterSpacing: 0.8 }]}>MENU</RNText>
                    </>
                )}
                contentContainerStyle={{ paddingBottom: 160 }}
            />
            <CartFAB navigation={navigation} />
        </AppBackground>
    );
};

const CartItemCard = ({ item }) => {
    const { theme } = useAppTheme();
    const { addToCart, removeFromCart, removeItemFromCart } = useCart();

    return (
        <BlurView intensity={theme.dark ? 20 : 40} tint={theme.dark ? 'dark' : 'light'}
            style={[styles.cartItemContainer, {
                borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(108,59,245,0.12)',
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
                marginBottom: 10, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
            }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
                <RNText style={{ fontSize: 15, fontWeight: '600', color: theme.colors.onSurface }}>{item.name}</RNText>
                <RNText style={{ color: theme.colors.primary, fontWeight: '700', marginTop: 4, fontSize: 14 }}>₹{item.price * item.quantity}</RNText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <LinearGradient colors={['#8B5CF6', '#6C3BF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 20, height: 36, paddingHorizontal: 4 }}>
                    <TouchableOpacity onPress={() => removeFromCart(item)} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="minus" size={16} color="#FFF" />
                    </TouchableOpacity>
                    <RNText style={{ color: '#FFF', fontWeight: '800', fontSize: 16, minWidth: 20, textAlign: 'center' }}>{item.quantity}</RNText>
                    <TouchableOpacity onPress={() => addToCart(item)} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                    </TouchableOpacity>
                </LinearGradient>
                <TouchableOpacity onPress={() => removeItemFromCart(item.id)} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="close-circle" size={22} color={theme.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>
            </View>
        </BlurView>
    );
};

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
                ListHeaderComponent={() => cart.length > 0 ? <Text variant="headlineMedium" style={{marginHorizontal: 16, marginTop: 16, marginBottom: 24, fontWeight: 'bold', color: theme.colors.onSurface}}>Your Order</Text> : null}
                renderItem={({item}) => {
                    const restaurantData = ALL_RESTAURANTS.find(r => r.name === item.title);
                    return (
                        <GlassCard style={{ marginHorizontal: 16, padding: 16, alignItems: 'flex-start' }}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                                {restaurantData?.image && (
                                    <Image source={{uri: restaurantData.image}} style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}} />
                                )}
                                <Text variant="titleLarge" style={{color: theme.colors.onSurface, flex: 1}}>{item.title}</Text>
                            </View>
                            {item.data.map(dish => <CartItemCard key={dish.id} item={dish} />)}
                        </GlassCard>
                    );
                }}
                ListFooterComponent={() => (
                    <>
                        {cart.length > 0 && (
                            <View style={{padding: 16, marginTop: 8}}>
                                <GlassButton title="Review Order & Address" onPress={() => navigation.navigate('Checkout')} />
                            </View>
                        )}
                    </>
                )}
                ListEmptyComponent={
                    <View style={{alignItems: 'center', marginTop: 80, paddingHorizontal: 32}}>
                        <MaterialCommunityIcons name="cart-off" size={80} color={theme.colors.onSurfaceVariant} />
                        <Text variant="headlineSmall" style={{color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 16, textAlign: 'center'}}>Your cart is empty</Text>
                        <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center'}}>Add something delicious from Mumbai's best spots</Text>
                        <View style={{marginTop: 24, width: '100%'}}>
                            <GlassButton title="Browse Restaurants" icon="silverware-fork-knife" onPress={() => navigation.goBack()} />
                        </View>
                    </View>
                }
                contentContainerStyle={{paddingBottom: 40, flexGrow: 1}}
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

    const deliveryFee = cartTotal > 299 ? 0 : originalDeliveryFee;
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
                        {[0, 25, 50, 100].map(tipValue => (
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
                            cartTotal > 299 ? (
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

const ORDER_STEPS = [
    { icon: 'check-circle', label: 'Order Placed' },
    { icon: 'chef-hat', label: 'Preparing' },
    { icon: 'motorbike', label: 'On the way' },
    { icon: 'home-circle', label: 'Delivered' },
];

export const OrderConfirmationScreen = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { lastOrder } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    
    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Simulate order progress
        const timers = [
            setTimeout(() => setActiveStep(1), 1500),
            setTimeout(() => setActiveStep(2), 3000),
        ];
        return () => timers.forEach(clearTimeout);
    },[]);

    return(
        <AppBackground>
            <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={true} fadeOut={true} explosionSpeed={400} />
            <View style={styles.confirmationContainer}>
                <Animated.View entering={ZoomIn.duration(600)}>
                    <MaterialCommunityIcons name="check-decagram" size={100} color={theme.colors.primary} />
                </Animated.View>
                <Text variant="headlineMedium" style={{color: theme.colors.onSurface, marginTop: 24, textAlign: 'center', fontWeight: 'bold'}}>Order Placed!</Text>
                <Text variant="bodyLarge" style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>Order ID: {lastOrder?.id}</Text>
                <Text variant="titleMedium" style={{color: theme.colors.onSurface, marginTop: 8}}>ETA: {lastOrder?.deliveryTime}</Text>

                {/* Step Tracker */}
                <View style={styles.stepTracker}>
                    {ORDER_STEPS.map((step, index) => (
                        <React.Fragment key={step.label}>
                            <View style={styles.stepItem}>
                                <View style={[styles.stepIcon, { backgroundColor: index <= activeStep ? theme.colors.primary : theme.colors.surfaceVariant }]}>
                                    <MaterialCommunityIcons name={step.icon} size={20} color={index <= activeStep ? '#FFF' : theme.colors.onSurfaceVariant} />
                                </View>
                                <Text style={{ fontSize: 11, color: index <= activeStep ? theme.colors.primary : theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>{step.label}</Text>
                            </View>
                            {index < ORDER_STEPS.length - 1 && (
                                <View style={[styles.stepLine, { backgroundColor: index < activeStep ? theme.colors.primary : theme.colors.surfaceVariant }]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

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

// PlaceholderScreen removed — all screens are now implemented

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
    const { pastOrders, addToCart } = useCart();

    const handleReorder = (order) => {
        triggerHaptic();
        order.items.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                addToCart(item);
            }
        });
        navigation.navigate('Cart');
    };

    return(
        <AppBackground>
            <FlatList
                data={pastOrders}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <GlassCard style={{padding: 16, marginHorizontal: 16, marginBottom: 16, alignItems: 'flex-start'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start'}}>
                            <View style={{flex: 1}}>
                                <Text variant="titleMedium" style={{fontWeight: 'bold', color: theme.colors.onSurface}}>Order {item.id}</Text>
                                <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant, marginTop: 2}}>{item.date}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleReorder(item)} style={[styles.reorderBtn, {backgroundColor: theme.colors.primaryContainer}]}>
                                <MaterialCommunityIcons name="reload" size={14} color={theme.colors.primary} />
                                <Text style={{color: theme.colors.primary, fontWeight: 'bold', fontSize: 13, marginLeft: 4}}>Reorder</Text>
                            </TouchableOpacity>
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
                ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 80, paddingHorizontal: 32}}><MaterialCommunityIcons name="history" size={80} color={theme.colors.onSurfaceVariant} /><Text variant="headlineSmall" style={{color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 16}}>No orders yet</Text><Text style={{color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center'}}>Your past orders will show up here</Text></View>}
                contentContainerStyle={{paddingTop: 16, paddingBottom: 40, flexGrow: 1}}
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
                            Platter v1.0.0
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

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return [];
        const allTags = [...new Set(ALL_RESTAURANTS.flatMap(r => r.tags))];
        return allTags
            .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(tag => ({ tag, restaurants: ALL_RESTAURANTS.filter(r => r.tags.includes(tag)) }));
    }, [searchQuery]);

    const renderSearchResult = ({ item }) => {
        if (searchType === 'restaurant') {
            return <BigRestaurantCard restaurant={item} theme={theme} navigation={navigation} index={0} />;
        }
        if (searchType === 'dish') {
            return <MenuItemCard item={item} restaurant={item.parentRestaurant} />;
        }
        // category
        return (
            <GlassCard style={{ marginHorizontal: 16, marginBottom: 12, alignItems: 'flex-start', padding: 12 }}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{item.tag}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.restaurants.length} restaurants</Text>
            </GlassCard>
        );
    };

    const searchData = searchType === 'restaurant' ? filteredRestaurants : searchType === 'dish' ? filteredDishes : filteredCategories;

    return(
        <AppBackground>
            <View style={{flex: 1, paddingTop: insets.top}}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8}}>
                    <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
                    <Searchbar 
                        placeholder={searchType === 'restaurant' ? 'Search restaurants...' : searchType === 'dish' ? 'Search dishes...' : 'Search categories...'}
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
                            { value: 'restaurant', label: 'Places' },
                            { value: 'dish', label: 'Dishes' },
                            { value: 'category', label: 'Category' },
                        ]}
                    />
                </View>
                <FlatList
                    data={searchData}
                    keyExtractor={(item, index) => (item.id || item.tag || '') + index.toString()}
                    renderItem={renderSearchResult}
                    ListEmptyComponent={
                        <View style={{alignItems: 'center', marginTop: 60}}>
                            <MaterialCommunityIcons name={searchQuery ? 'magnify-close' : 'magnify'} size={64} color={theme.colors.onSurfaceVariant} />
                            <Text style={{textAlign: 'center', marginTop: 12, color: theme.colors.onSurfaceVariant}}>{searchQuery ? 'No results found.' : 'Start typing to search...'}</Text>
                        </View>
                    }
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
    networkBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, padding: 12, borderRadius: 12, marginBottom: 16 },
    categoryItem: { alignItems: 'center', marginRight: 20 },
    categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    moodItem: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 12 },
    sortChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    authContainer: { flex: 1 },
    authContent: { flex: 1, alignItems: 'center', padding: 20 },
    stageContainer: { flex: 1, width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 30},
    appNameTitle: { fontSize: 80, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
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
    profileInput: {width: '100%', marginBottom: 16},
    restaurantHeroImage: { width: '100%', height: 220 },
    restaurantHeroOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8 },
    offerBadge: { backgroundColor: 'rgba(108,59,245,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    stepTracker: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 32, paddingHorizontal: 8 },
    stepItem: { alignItems: 'center', width: 64 },
    stepIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    stepLine: { height: 3, flex: 1, marginTop: 18, marginHorizontal: 4, borderRadius: 2 },
    reorderBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
});

// ─── PastOrderItem component ────────────────────────────────────────────────
const PastOrderItem = ({ item, restaurant, theme }) => {
    const { addToCart } = useCart();
    return (
        <View style={[rdStyles.pastOrderItem, { borderBottomColor: theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
            <Image source={{ uri: restaurant.image }} style={rdStyles.pastOrderImage} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[rdStyles.pastOrderName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                <Text style={[rdStyles.pastOrderPrice, { color: theme.colors.onSurfaceVariant }]}>₹{item.price}</Text>
            </View>
            <TouchableOpacity
                style={[rdStyles.addBtn, { backgroundColor: theme.colors.primary, width: 80 }]}
                onPress={() => { addToCart({ ...item, restaurantName: restaurant.name }); }}
            >
                <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                <Text style={rdStyles.addBtnText}>ADD</Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── Home screen styles ──────────────────────────────────────────────────────
const homeStyles = StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, overflow: 'hidden' },
    topBarLocation: { fontSize: 16, fontWeight: '700', marginRight: 2 },
    topBarAddress: { fontSize: 12, marginTop: 1 },
    avatarBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
    avatarLabel: { color: '#FFF', fontWeight: '800', fontSize: 16 },
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginVertical: 12, gap: 10 },
    searchBox: { flex: 1 },
    searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 8, overflow: 'hidden' },
    searchPlaceholder: { fontSize: 14, flex: 1 },
    vegToggle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    offlineBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, padding: 10, borderRadius: 14, marginBottom: 10, borderWidth: 1, overflow: 'hidden' },
    bannerSlide: { width: SCREEN_WIDTH - 32, height: 154, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, justifyContent: 'space-between', borderRadius: 22, overflow: 'hidden' },
    bannerTextBlock: { flex: 1 },
    bannerTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2, color: 'rgba(255,255,255,0.65)' },
    bannerHighlight: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
    bannerSub: { fontSize: 12, marginBottom: 14, color: 'rgba(255,255,255,0.6)' },
    bannerBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, gap: 4 },
    bannerBtnText: { fontSize: 12, fontWeight: '700' },
    bannerIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
    dot: { height: 6, borderRadius: 3, transition: 'width 0.3s' },
    categoryScroll: { paddingHorizontal: 16, gap: 18, paddingBottom: 12, paddingTop: 6 },
    categoryItem: { alignItems: 'center' },
    categoryImageWrap: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', marginBottom: 6 },
    categoryImage: { width: '100%', height: '100%' },
    categoryLabel: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
    chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, flexDirection: 'row' },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    chipLabel: { fontSize: 13, fontWeight: '600' },
    sortChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
    recommendedGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 8 },
    recommendedCell: { width: (SCREEN_WIDTH - 44) / 3, marginBottom: 4 },
    recommendedImageWrap: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 6, position: 'relative', borderWidth: 1 },
    recommendedImage: { width: '100%', height: '100%' },
    recommendedOfferTag: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 4, paddingVertical: 3 },
    recommendedOfferText: { color: '#FFF', fontSize: 9, fontWeight: '600' },
    recommendedRating: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, gap: 2 },
    recommendedRatingText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    recommendedName: { fontSize: 12, fontWeight: '600', marginBottom: 1 },
    recommendedMeta: { fontSize: 11, marginLeft: 3 },
});

// ─── Restaurant Details screen styles ───────────────────────────────────────
const rdStyles = StyleSheet.create({
    heroWrap: { position: 'relative' },
    heroImage: { width: '100%', height: 280 },
    backBtn: { position: 'absolute', left: 12, overflow: 'hidden' },
    backBtnBlur: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    infoCard: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, overflow: 'hidden' },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    restaurantName: { fontSize: 22, fontWeight: '800', flex: 1, marginRight: 12 },
    ratingBubble: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, gap: 4 },
    ratingText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
    reviewCount: { fontSize: 12, marginBottom: 4 },
    tagsLine: { fontSize: 13, marginBottom: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 },
    metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13 },
    offerStrip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 10, marginBottom: 4, overflow: 'hidden' },
    offerStripText: { flex: 1, fontSize: 13, fontWeight: '600' },
    offerCountText: { fontSize: 13, fontWeight: '700' },
    offerListItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    offerListText: { fontSize: 13, flex: 1 },
    filtersRow: { borderBottomWidth: 1, overflow: 'hidden' },
    filterPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, overflow: 'hidden' },
    filterPillText: { fontSize: 13, fontWeight: '600' },
    sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    sectionSubtitle: { fontSize: 12, marginBottom: 12 },
    pastOrderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
    pastOrderImage: { width: 44, height: 44, borderRadius: 10 },
    pastOrderName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    pastOrderPrice: { fontSize: 13 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 12, marginBottom: 10, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    menuItemName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    menuItemPrice: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    menuItemRight: { width: 110, alignItems: 'center' },
    menuItemImage: { width: 100, height: 90, borderRadius: 14 },
    menuItemAction: { position: 'absolute', bottom: -6 },
    qtyBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, height: 36, width: 100, justifyContent: 'space-between', overflow: 'hidden' },
    qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    qtyText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, height: 34, width: 100, gap: 4, overflow: 'hidden' },
    addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    highlyOrderedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    highlyOrderedText: { fontSize: 11, color: '#FF6D00', fontWeight: '700' },
});
