// ============================================================
// App.tsx — Root entry point for Kinaja Entregador
// Loads fonts, initializes navigation, handles auth state
// ============================================================

import React, { useEffect } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

// Suppress known non-critical warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Keep native splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {
  // On web or when splash screen is not available, ignore
});

export default function App() {
  // Load Poppins font family
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  // Initialize auth state from storage
  const loadToken = useAuthStore((s) => s.loadToken);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Hide native splash screen as soon as fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors on web or when splash screen is not available
      });
    }
  }, [fontsLoaded, fontError]);

  // Wait for fonts to load — show nothing (native splash covers this)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#EB2835"
            translucent
          />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
