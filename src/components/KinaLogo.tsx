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
      <View style={styles.bubble}>
        <Text style={styles.textKina}>KINA</Text>
        <Text style={styles.textJa}>JÁ</Text>
        {/* Tail of the speech bubble */}
        <View style={styles.tail} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bubble: {
    backgroundColor: COLORS.kinaOrange, // Using the orange from the left side of the new logo
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: RADII.xl,
    borderBottomLeftRadius: RADII.sm, // Make it look a bit like a speech bubble
    alignItems: 'flex-end',
    // Shadow
    shadowColor: COLORS.kinaRedDark,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 10,
    borderWidth: 2,
    borderColor: COLORS.kinaRed,
  },
  textKina: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: COLORS.kinaCream,
    letterSpacing: -1,
    lineHeight: 52,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  textJa: {
    fontFamily: FONTS.black,
    fontSize: 56,
    color: COLORS.kinaCream,
    letterSpacing: -2,
    lineHeight: 60,
    marginTop: -8,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  tail: {
    position: 'absolute',
    bottom: -15,
    left: 20,
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderTopColor: COLORS.kinaOrange,
    borderRightWidth: 15,
    borderRightColor: 'transparent',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    zIndex: -1,
  },
});
