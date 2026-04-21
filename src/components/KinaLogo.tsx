// ============================================================
// KinaLogo — Animated brand logo component
// Recreates the KINA/JÁ stacked logo from the splash reference
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, RADII } from '../constants/theme';

interface KinaLogoProps {
  /** Scale multiplier (default: 1) */
  scale?: number;
  /** Whether to animate the logo pop-in */
  animate?: boolean;
}

export default function KinaLogo({ scale = 1, animate = true }: KinaLogoProps) {
  const scaleAnim = useRef(new Animated.Value(animate ? 0.5 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animate, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, scale) },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* KINA block — cream background, slight rotation */}
      <View style={[styles.kinaBlock, { transform: [{ rotate: '-2deg' }] }]}>
        <Text style={styles.kinaText}>KINA</Text>
      </View>

      {/* JÁ block — red background with cream border, opposite rotation */}
      <View style={[styles.jaBlock, { transform: [{ rotate: '3deg' }] }]}>
        <Text style={styles.jaText}>JÁ</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  kinaBlock: {
    backgroundColor: COLORS.kinaCream,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADII.lg,
    marginBottom: -8,
    zIndex: 2,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  kinaText: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: COLORS.kinaRed,
    letterSpacing: -2,
  },
  jaBlock: {
    backgroundColor: COLORS.kinaRed,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: RADII.xl,
    borderWidth: 4,
    borderColor: COLORS.kinaCream,
    zIndex: 1,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  jaText: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: COLORS.kinaCream,
    letterSpacing: -2,
  },
});
