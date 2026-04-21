// ============================================================
// SplashScreen — app launch screen
// Full red background with animated KINA/JÁ logo
// Matches the HTML splash reference design
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, FONT_SIZES, RADII } from '../../constants/theme';
import KinaLogo from '../../components/KinaLogo';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types';

type SplashNav = StackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  // useNavigation may not be available if rendered outside a navigator
  let navigation: SplashNav | null = null;
  try {
    navigation = useNavigation<SplashNav>();
  } catch {
    // Rendered standalone (loading state in AppNavigator) — no navigation context
  }

  const { isAuthenticated, isInitialized, loadToken } = useAuth();

  // Animations
  const badgePulse = useRef(new Animated.Value(0.6)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Badge pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [badgePulse]);

  // Spinner rotation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  // Bottom content fade in
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  // Load token and navigate after 3 seconds
  useEffect(() => {
    loadToken();

    // Only attempt navigation if we're inside a navigator
    if (!navigation) return;

    const timer = setTimeout(() => {
      if (!isAuthenticated && navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, loadToken, navigation]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.kinaRed} />

      {/* Logo */}
      <KinaLogo scale={1.1} animate={true} />

      {/* Badge: "Para Entregadores" */}
      <Animated.View style={[styles.badge, { opacity: badgePulse }]}>
        <Text style={styles.badgeText}>Para Entregadores</Text>
      </Animated.View>

      {/* Loading spinner at bottom */}
      <Animated.View style={[styles.bottomContainer, { opacity: fadeIn }]}>
        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spin }] },
          ]}
        />
        <Text style={styles.loadingText}>Conectando ao mapa...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.kinaRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    marginTop: 8,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: COLORS.kinaCream,
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(251,239,184,0.8)',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
