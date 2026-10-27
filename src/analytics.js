import { Platform } from 'react-native';
import posthog from 'posthog-js';

export const POSTHOG_API_KEY = 'phc_D5tFaypWHQsrFDXoUTQLWmC8RpbuVpqHQ7qjZwoLm9QC';
export const POSTHOG_HOST = 'https://us.i.posthog.com';

let isInitialized = false;

/**
 * Initializes PostHog client-side analytics on web.
 * Safe no-op on native platforms.
 */
export const initAnalytics = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isInitialized) return;

    try {
        posthog.init(POSTHOG_API_KEY, {
            api_host: POSTHOG_HOST,
            ui_host: 'https://us.posthog.com',
            cross_subdomain_cookie: true,
            capture_pageview: false, // We track $pageview manually on React Navigation state changes
            capture_pageleave: true,
            autocapture: true,
            persistence: 'localStorage+cookie',
        });
        isInitialized = true;
    } catch (err) {
        console.warn('[PostHog] Initialization error:', err);
    }
};

/**
 * Maps React Navigation route state to a human-readable title and clean URL path.
 */
export const getRouteMetadata = (route) => {
    if (!route || !route.name) {
        return {
            title: 'Platter | Discover & Order Food',
            path: '/',
        };
    }

    const { name, params } = route;

    switch (name) {
        case 'Home': {
            const mode = params?.filterMode;
            if (mode === 'under250') {
                return { title: 'Platter | Under ₹250 Budget Eats', path: '/under-250' };
            }
            if (mode === 'healthy') {
                return { title: 'Platter | Healthy Bowls & Salads', path: '/healthy' };
            }
            if (mode === 'street') {
                return { title: 'Platter | Street Food Cravings', path: '/street-food' };
            }
            if (mode === 'party') {
                return { title: 'Platter | Party Size Meals', path: '/party' };
            }
            if (mode === 'late') {
                return { title: 'Platter | Late Night Cravings', path: '/late-night' };
            }
            if (mode === 'quick') {
                return { title: 'Platter | Quick Bites', path: '/quick-bites' };
            }
            return { title: 'Platter | Discover & Order Food', path: '/' };
        }
        case 'Under250':
            return { title: 'Platter | Under ₹250 Budget Eats', path: '/under-250' };
        case 'Healthy':
            return { title: 'Platter | Healthy Bowls & Salads', path: '/healthy' };
        case 'Search':
            return { title: 'Platter | Search Dishes & Restaurants', path: '/search' };
        case 'RestaurantDetails': {
            const restName = params?.restaurant?.name || params?.name || 'Restaurant';
            const restId = params?.restaurant?.id || params?.id;
            return {
                title: `Platter | ${restName}`,
                path: restId ? `/restaurant/${restId}` : '/restaurant',
            };
        }
        case 'Cart':
            return { title: 'Platter | Your Cart', path: '/cart' };
        case 'Checkout':
            return { title: 'Platter | Checkout', path: '/checkout' };
        case 'OrderConfirmation':
            return { title: 'Platter | Order Confirmed', path: '/order-confirmation' };
        case 'MyCollections':
            return { title: 'Platter | My Collections', path: '/collections' };
        case 'PastOrders':
            return { title: 'Platter | Past Orders', path: '/orders' };
        case 'MyAddresses':
            return { title: 'Platter | Delivery Addresses', path: '/addresses' };
        case 'DeliveryDetails':
            return { title: 'Platter | Delivery Details', path: '/delivery-details' };
        case 'Settings':
            return { title: 'Platter | Settings', path: '/settings' };
        case 'Profile':
            return { title: 'Platter | My Profile', path: '/profile' };
        case 'Auth':
            return { title: 'Platter | Sign In', path: '/auth' };
        default:
            return {
                title: `Platter | ${name}`,
                path: `/${name.toLowerCase()}`,
            };
    }
};

/**
 * Tracks a pageview in PostHog, updates document.title, and syncs history state on web.
 */
export const trackPageView = (route) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (!isInitialized) {
        initAnalytics();
    }

    const { title, path } = getRouteMetadata(route);

    // Update document title for browser tab and PostHog
    if (typeof document !== 'undefined') {
        document.title = title;
    }

    // Update browser URL bar so path matches current screen (Vercel rewrites handle direct reloads)
    try {
        if (window.history && window.history.replaceState) {
            window.history.replaceState({ screen: route?.name }, title, path);
        }
    } catch {
        // Ignore sandbox or security errors if running within an iframe
    }

    const currentUrl = `${window.location.origin}${path}`;

    try {
        posthog.capture('$pageview', {
            $current_url: currentUrl,
            $pathname: path,
            $title: title,
            screen_name: route?.name || 'Unknown',
            filter_mode: route?.params?.filterMode,
            restaurant_id: route?.params?.restaurant?.id || route?.params?.id,
            restaurant_name: route?.params?.restaurant?.name || route?.params?.name,
        });
    } catch (err) {
        console.warn('[PostHog] Failed to capture $pageview:', err);
    }
};

/**
 * Identifies the current user in PostHog across subdomains.
 */
export const identifyUser = (userId, traits = {}) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
        if (userId) {
            posthog.identify(userId, traits);
        } else {
            posthog.reset();
        }
    } catch (err) {
        console.warn('[PostHog] Identify error:', err);
    }
};

export default posthog;

