import React from 'react';
import { UserProvider, ThemeProvider, SettingsProvider, CartProvider } from './src/context';
import RootNavigator from './src/navigation';

export default function App() {
    return (
        <UserProvider>
            <ThemeProvider>
              <SettingsProvider>
                <CartProvider>
                  <RootNavigator />
                </CartProvider>
              </SettingsProvider>
            </ThemeProvider>
        </UserProvider>
    );
}

