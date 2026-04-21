// ============================================================
// LoadingSpinner — branded loading indicator
// ============================================================

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

interface LoadingSpinnerProps {
  /** Optional message below the spinner */
  message?: string;
  /** Color of the spinner */
  color?: string;
  /** Size variant */
  size?: 'small' | 'large';
  /** Full screen overlay mode */
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message,
  color = COLORS.kinaCream,
  size = 'large',
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.messageLight}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  message: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageLight: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textWhite,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
