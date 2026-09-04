import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, Text as RNText, TextInput as RNTextInput, Image, Pressable } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useUser, useAppTheme, useCart } from './context';
import { ALL_RESTAURANTS } from './data';

const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const { width: SW } = Dimensions.get('window');

// ─── AppBackground ────────────────────────────────────────────────────────────
// Colorful gradient backdrop — the frosted glass layers sit on top of this.
export const AppBackground = ({ children }) => {
    const { theme } = useAppTheme();
    const gradientColors = theme.dark
        ? ['#0D0B1E', '#150F2E', '#1A1040', '#0D0B1E']
        : ['#F0EBFF', '#E8E0FF', '#F5F3FF', '#EBF0FF'];

    return (
        <LinearGradient
            colors={gradientColors}
            locations={[0, 0.35, 0.7, 1]}
            style={{ flex: 1 }}
        >
            {children}
        </LinearGradient>
    );
};

// ─── GlassCard ───────────────────────────────────────────────────────────────
// Frosted glass pill card — the primary surface in the UI.
export const GlassCard = ({ children, style, onPress }) => {
    const { theme } = useAppTheme();

    const glassBg = theme.dark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(255, 255, 255, 0.65)';
    const glassBorder = theme.dark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(255, 255, 255, 0.9)';

    const content = (
        <BlurView
            intensity={theme.dark ? 40 : 60}
            tint={theme.dark ? 'dark' : 'light'}
            style={[
                cStyles.glassCard,
                {
                    backgroundColor: glassBg,
                    borderColor: glassBorder,
                },
                style,
            ]}
        >
            {children}
        </BlurView>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{content}</TouchableOpacity>;
    }
    return content;
};

// ─── GlassInput ──────────────────────────────────────────────────────────────
export const GlassInput = ({ label, value, onChangeText, keyboardType, maxLength, error }) => {
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = useAppTheme();

    const borderColor = error
        ? '#FF5252'
        : isFocused
            ? theme.colors.primary
            : theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(108,59,245,0.2)';

    return (
        <BlurView
            intensity={theme.dark ? 30 : 50}
            tint={theme.dark ? 'dark' : 'light'}
            style={[
                cStyles.glassInputWrap,
                {
                    borderColor,
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                },
            ]}
        >
            <RNText style={[
                cStyles.glassInputLabel,
                {
                    color: isFocused ? theme.colors.primary : theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(108,59,245,0.55)',
                    top: (isFocused || value) ? 6 : 16,
                    fontSize: (isFocused || value) ? 11 : 15,
                },
            ]}>
                {label}
            </RNText>
            <RNTextInput
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                maxLength={maxLength}
                style={[cStyles.glassInput, { color: theme.dark ? '#FFFFFF' : theme.colors.onSurface, paddingTop: (isFocused || value) ? 22 : 14 }]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor="transparent"
            />
        </BlurView>
    );
};

// ─── GlassButton ─────────────────────────────────────────────────────────────
// A premium pill-shaped gradient button.
export const GlassButton = ({ onPress, title, icon, style, disabled }) => {
    const { theme } = useAppTheme();

    const gradientColors = disabled
        ? [theme.colors.surfaceDisabled, theme.colors.surfaceDisabled]
        : theme.dark
            ? ['#9D7BFF', '#6C3BF5']
            : ['#8B5CF6', '#6C3BF5'];

    const handlePress = () => {
        if (!disabled) {
            triggerHaptic();
            onPress();
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={0.82} style={style}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={cStyles.glassButton}
            >
                {icon && <MaterialCommunityIcons name={icon} color="#FFFFFF" size={20} style={{ marginRight: 8 }} />}
                <RNText style={cStyles.glassButtonLabel}>{title}</RNText>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// ─── BigRestaurantCard ────────────────────────────────────────────────────────
export const BigRestaurantCard = ({ restaurant, theme, navigation, index, filterMode }) => {
    const { favorites, toggleFavorite } = useUser();
    const isFavorite = favorites.includes(restaurant.id);

    const getRatingColor = (r) => r >= 4 ? '#22C55E' : r >= 3 ? '#F59E0B' : '#EF4444';

    const handleFav = () => { triggerHaptic(); toggleFavorite(restaurant.id); };
    const handlePress = () => { triggerHaptic(); navigation.navigate('RestaurantDetails', { restaurant, filterMode }); };

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={bigStyles.wrapper}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.92}>
                <BlurView
                    intensity={theme.dark ? 30 : 55}
                    tint={theme.dark ? 'dark' : 'light'}
                    style={[bigStyles.card, {
                        borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)',
                        backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                    }]}
                >
                    {/* Cover image */}
                    <View style={bigStyles.imageWrap}>
                        <Image source={{ uri: restaurant.image }} style={bigStyles.image} resizeMode="cover" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.55)']}
                            style={bigStyles.imageOverlay}
                        />
                        {/* Favourite button */}
                        <TouchableOpacity onPress={handleFav} style={bigStyles.favBtn}>
                            <BlurView intensity={60} tint="dark" style={bigStyles.favBlur}>
                                <MaterialCommunityIcons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
                                    size={18}
                                />
                            </BlurView>
                        </TouchableOpacity>
                        {/* Offer badge */}
                        {restaurant.offer && (
                            <View style={bigStyles.offerPill}>
                                <MaterialCommunityIcons name="tag" size={11} color="#FFF" style={{ marginRight: 3 }} />
                                <RNText style={bigStyles.offerText}>{restaurant.offer}</RNText>
                            </View>
                        )}
                        {/* Rating bottom-left */}
                        <View style={[bigStyles.ratingPill, { backgroundColor: getRatingColor(restaurant.rating) }]}>
                            <MaterialCommunityIcons name="star" size={12} color="#FFF" style={{ marginRight: 3 }} />
                            <RNText style={bigStyles.ratingText}>{restaurant.rating}</RNText>
                        </View>
                    </View>

                    {/* Info */}
                    <View style={bigStyles.info}>
                        <RNText style={[bigStyles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>{restaurant.name}</RNText>
                        <View style={bigStyles.metaRow}>
                            <View style={bigStyles.metaItem}>
                                <MaterialCommunityIcons name="clock-outline" size={13} color={theme.colors.onSurfaceVariant} />
                                <RNText style={[bigStyles.metaText, { color: theme.colors.onSurfaceVariant }]}>{restaurant.deliveryTime} min</RNText>
                            </View>
                            <View style={bigStyles.metaDot} />
                            <View style={bigStyles.metaItem}>
                                <MaterialCommunityIcons name="map-marker-outline" size={13} color={theme.colors.onSurfaceVariant} />
                                <RNText style={[bigStyles.metaText, { color: theme.colors.onSurfaceVariant }]}>{restaurant.distance}</RNText>
                            </View>
                        </View>
                        <RNText style={[bigStyles.tags, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>{restaurant.tags.join(' · ')}</RNText>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── RecommendedCard ──────────────────────────────────────────────────────────
export const RecommendedCard = ({ restaurant, theme, navigation, filterMode }) => {
    return (
        <TouchableOpacity
            onPress={() => { triggerHaptic(); navigation.navigate('RestaurantDetails', { restaurant: ALL_RESTAURANTS.find(r => r.id === restaurant.id) || restaurant, filterMode }); }}
            activeOpacity={0.88}
            style={{ width: (SW - 48) / 2.3 }}
        >
            <BlurView
                intensity={theme.dark ? 30 : 55}
                tint={theme.dark ? 'dark' : 'light'}
                style={[recStyles.card, {
                    borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)',
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                }]}
            >
                <View style={recStyles.imageWrap}>
                    <Image source={{ uri: restaurant.image }} style={recStyles.image} resizeMode="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFill} />
                    <View style={[recStyles.ratingPill, { backgroundColor: restaurant.rating >= 4 ? '#22C55E' : '#F59E0B' }]}>
                        <MaterialCommunityIcons name="star" size={10} color="#FFF" style={{ marginRight: 2 }} />
                        <RNText style={recStyles.ratingText}>{restaurant.rating}</RNText>
                    </View>
                    {restaurant.offer && (
                        <View style={recStyles.discountPill}>
                            <MaterialCommunityIcons name="percent" size={10} color="#FFF" />
                        </View>
                    )}
                </View>
                <View style={recStyles.info}>
                    <RNText style={[recStyles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>{restaurant.name}</RNText>
                    <RNText style={[recStyles.time, { color: theme.colors.onSurfaceVariant }]}>{restaurant.deliveryTime} min</RNText>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

// ─── CartFAB ──────────────────────────────────────────────────────────────────
export const CartFAB = ({ navigation, bottomOffset }) => {
    const { cart, cartTotal, cartItemCount } = useCart();
    const { theme } = useAppTheme();

    if (cart.length === 0) return null;

    const resolvedBottom = bottomOffset !== undefined ? bottomOffset : 100;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.9}
            style={[fabStyles.wrapper, { bottom: resolvedBottom }]}
        >
            <BlurView intensity={80} tint="dark" style={fabStyles.blurPill}>
                <LinearGradient
                    colors={['rgba(108,59,245,0.95)', 'rgba(157,123,255,0.95)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={fabStyles.gradient}
                >
                    <View style={fabStyles.leftSection}>
                        <View style={fabStyles.countBadge}>
                            <RNText style={fabStyles.countText}>{cartItemCount}</RNText>
                        </View>
                        <RNText style={fabStyles.label}>View Cart</RNText>
                    </View>
                    <View style={fabStyles.rightSection}>
                        <RNText style={fabStyles.price}>₹{cartTotal}</RNText>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#FFF" />
                    </View>
                </LinearGradient>
            </BlurView>
        </TouchableOpacity>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const cStyles = StyleSheet.create({
    glassCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden',
        marginBottom: 16,
        alignItems: 'center',
    },
    glassInputWrap: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1.5,
        height: 60,
        overflow: 'hidden',
        marginBottom: 4,
        position: 'relative',
    },
    glassInputLabel: {
        position: 'absolute',
        left: 16,
        fontWeight: '500',
        zIndex: 1,
    },
    glassInput: {
        position: 'absolute',
        bottom: 8,
        left: 16,
        right: 16,
        fontSize: 16,
        height: 32,
    },
    glassButton: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassButtonLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

const bigStyles = StyleSheet.create({
    wrapper: { marginHorizontal: 16, marginBottom: 14 },
    card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
    imageWrap: { position: 'relative' },
    image: { width: '100%', height: 190 },
    imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
    favBtn: { position: 'absolute', top: 12, right: 12 },
    favBlur: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    offerPill: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108,59,245,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    offerText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    ratingPill: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
    ratingText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    info: { paddingHorizontal: 16, paddingVertical: 14 },
    name: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#999', marginHorizontal: 8 },
    metaText: { fontSize: 13 },
    tags: { fontSize: 12, opacity: 0.7 },
});

const recStyles = StyleSheet.create({
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    imageWrap: { position: 'relative' },
    image: { width: '100%', height: 110 },
    ratingPill: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12 },
    discountPill: { position: 'absolute', top: 8, right: 8, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    ratingText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    info: { paddingHorizontal: 10, paddingVertical: 10 },
    name: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    time: { fontSize: 11 },
});

const fabStyles = StyleSheet.create({
    wrapper: { position: 'absolute', bottom: 100, left: 20, right: 20 },
    blurPill: { borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    leftSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    countBadge: { backgroundColor: 'rgba(255,255,255,0.25)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    countText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    label: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    price: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});