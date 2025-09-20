import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, Text as RNText, TextInput as RNTextInput, Image, Pressable, FlatList, ScrollView } from 'react-native';
import { Card, Text, FAB, Avatar, Switch, Searchbar, List, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useUser, useAppTheme, useCart } from './context';
import { ALL_RESTAURANTS } from './data';

const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export const GlassCard = ({ children, style, blur }) => {
    const { theme } = useAppTheme();
    const Component = blur ? BlurView : View;
    
    const blurProps = blur ? { 
        intensity: 90, 
        tint: theme.dark ? 'dark' : 'light' 
    } : {};
    
    const cardStyle = [
        styles.glassCard,
        theme.dark ? styles.glassCardDark : styles.glassCardLight,
        style
    ];

    return (
        <Component style={cardStyle} {...blurProps}>
            {children}
        </Component>
    );
};

export const GlassInput = ({ label, value, onChangeText, keyboardType, maxLength, error, hideLabelInDarkMode }) => {
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = useAppTheme();
    
    const containerStyle = [
        styles.glassInputContainer,
        theme.dark ? styles.glassInputContainerDark : styles.glassInputContainerLight,
        error ? styles.errorBorder : {}
    ];

    // FIX: This logic now hides the label in dark mode if the prop is passed
    const showLabel = !(hideLabelInDarkMode && theme.dark && value);

    return (
        <View style={containerStyle}>
            <Animated.Text 
                style={[
                    styles.glassInputLabel, 
                    { color: theme.dark ? (isFocused ? '#FFFFFF' : '#E0E0E0') : (isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant) }, 
                    (isFocused || value) && styles.glassInputLabelFocused,
                    value && !isFocused ? { opacity: 0 } : { opacity: 1 },
                    !showLabel && { opacity: 0 }
                ]}
                pointerEvents="none" 
            >
                {label}
            </Animated.Text>
            <RNTextInput
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                maxLength={maxLength}
                style={[styles.glassInput, {color: theme.dark ? '#FFFFFF' : theme.colors.onSurface}]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={theme.dark ? '#E0E0E0' : theme.colors.onSurfaceVariant}
            />
        </View>
    );
};

export const GlassButton = ({ onPress, title, icon, style, disabled }) => {
    const { theme } = useAppTheme();
    const buttonStyle = [
        styles.glassButton,
        theme.dark ? styles.glassButtonDark : styles.glassButtonLight,
        disabled && { backgroundColor: theme.colors.surfaceDisabled },
        style
    ];
    
    const handlePress = () => {
        triggerHaptic();
        onPress();
    }

    return (
        <TouchableOpacity onPress={handlePress} style={buttonStyle} disabled={disabled}>
            {icon && <MaterialCommunityIcons name={icon} color={disabled ? theme.colors.onSurfaceDisabled : "#FFFFFF"} size={20} style={{marginRight: 8}} />}
            <Text style={[styles.glassButtonLabel, {color: disabled ? theme.colors.onSurfaceDisabled : "#FFFFFF"}]}>{title}</Text>
        </TouchableOpacity>
    );
};

export const AppBackground = ({ children }) => {
    const { theme } = useAppTheme();

    const backgroundStyle = {
        flex: 1,
        backgroundColor: theme.colors.background,
    };

    return (
        <View style={backgroundStyle}>
            {children}
        </View>
    );
};

export const BigRestaurantCard = ({ restaurant, theme, navigation, index }) => {
    const { favorites, toggleFavorite } = useUser();
    const isFavorite = favorites.includes(restaurant.id);

    const glassStyle = theme.dark
        ? { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1 }
        : { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1 };

    const handleFavoriteToggle = () => {
        triggerHaptic();
        toggleFavorite(restaurant.id);
    }

    return (
        <TouchableOpacity onPress={() => { triggerHaptic(); navigation.navigate('RestaurantDetails', { restaurant }); }}>
            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                <Card style={[{ borderRadius: 16, overflow: 'hidden', marginHorizontal: 16, marginBottom: 16, backgroundColor: 'transparent' }, glassStyle]}>
                    <Card.Cover source={{ uri: restaurant.image }} style={{ height: 180 }} />
                    <TouchableOpacity onPress={handleFavoriteToggle} style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 18, padding: 6 }}>
                        <MaterialCommunityIcons name={isFavorite ? "heart" : "heart-outline"} color={isFavorite ? theme.colors.primary : "#fff"} size={24} />
                    </TouchableOpacity>
                    <Card.Title
                        title={restaurant.name}
                        titleStyle={{ fontWeight: 'bold', fontSize: 20, color: theme.colors.onSurface }}
                        subtitle={`${restaurant.rating} ★ (${restaurant.reviews}) • ${restaurant.deliveryTime}min • ${restaurant.distance}`}
                        subtitleStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                        right={() => restaurant.offer ? (<Text style={{ marginRight: 16, color: theme.colors.primary, fontWeight: 'bold' }}>{restaurant.offer}</Text>) : null}
                    />
                </Card>
            </Animated.View>
        </TouchableOpacity>
    );
};

export const RecommendedCard = ({ restaurant, theme, navigation }) => {
     const glassStyle = theme.dark
        ? { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1 }
        : { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1 };

    return (
    <TouchableOpacity onPress={() => { triggerHaptic(); navigation.navigate('RestaurantDetails', { restaurant: ALL_RESTAURANTS.find(r => r.id === restaurant.id) || ALL_RESTAURANTS[0] }); }}>
        <Animated.View entering={FadeInUp.duration(500)} style={{ width: (Dimensions.get('window').width - 48) / 2.3, borderRadius: 12, overflow: 'hidden' }}>
            <Card style={glassStyle}>
                <Card.Cover source={{ uri: restaurant.image }} style={{ height: 100 }} />
                <Card.Title title={restaurant.name} titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface, fontSize: 14 }} titleNumberOfLines={1} />
            </Card>
        </Animated.View>
    </TouchableOpacity>
)};

export const CartFAB = ({ navigation }) => {
    const { cart, cartTotal, cartItemCount } = useCart();
    const theme = useAppTheme().theme;
    
    const fabGlassStyle = theme.dark
        ? { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant, borderWidth: 1}
        : { backgroundColor: 'rgba(247, 244, 233, 0.8)', borderColor: 'rgba(34, 17, 18, 0.2)', borderWidth: 1};

    if (cart.length === 0) return null;
    return (
        <FAB
            icon="cart"
            label={`View Cart (${cartItemCount}) - ₹${cartTotal}`}
            style={[styles.fab, fabGlassStyle]}
            onPress={() => navigation.navigate('Cart')}
            color={theme.colors.primary}
            variant='secondary'
        />
    );
};

const styles = StyleSheet.create({
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
    glassCard: { padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
    glassCardDark: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' },
    glassCardLight: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(255, 255, 255, 0.3)' },
    glassInputContainer: { width: '100%', borderRadius: 12, borderWidth: 1, height: 56 },
    glassInputContainerDark: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' },
    glassInputContainerLight: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.1)' },
    glassInputLabel: { position: 'absolute', left: 16, top: 16, fontSize: 16 },
    glassInputLabelFocused: { top: 6, fontSize: 12 },
    glassInput: { height: '100%', width: '100%', fontSize: 16, paddingHorizontal: 16 },
    errorBorder: {
        borderColor: 'rgba(255, 82, 82, 0.7)', 
    },
    glassButton: { flexDirection: 'row', width: '100%', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    glassButtonDark: { backgroundColor: '#d44d5c' },
    glassButtonLight: { backgroundColor: 'rgba(149, 7, 20, 0.9)' },
    glassButtonLabel: { fontSize: 18, fontWeight: 'bold' }
});