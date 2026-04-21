// ============================================================
// MapViewWrapper — cross-platform map component
// Uses platform-specific files to avoid web bundle crash
// On native: provides react-native-maps components
// On web: provides a fallback UI
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

// On web, we CANNOT import react-native-maps at all — even a conditional
// require() will get bundled by Metro. So we export fallback-only components.

/** Fallback map view for web */
export const MapView = null;
export const Marker = null;
export const Polyline = null;
export const PROVIDER_GOOGLE = null;

/** Fallback view when maps are not available (web) */
export function MapFallback({ children }: { children?: React.ReactNode }) {
  return (
    <View style={fallbackStyles.container}>
      <View style={fallbackStyles.content}>
        <Text style={fallbackStyles.icon}>🗺️</Text>
        <Text style={fallbackStyles.title}>Mapa</Text>
        <Text style={fallbackStyles.subtitle}>
          O mapa está disponível apenas no dispositivo mobile
        </Text>
      </View>
      {children}
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECEF',
    position: 'relative',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
