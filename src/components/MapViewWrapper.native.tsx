// ============================================================
// MapViewWrapper — Native platform version
// Provides react-native-maps components for iOS/Android
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

// Safe to import on native — this file is NEVER bundled for web
import RNMapView, {
  Marker as RNMarker,
  Polyline as RNPolyline,
} from 'react-native-maps';

// Re-export for use in screens
// Don't use PROVIDER_GOOGLE — it crashes in Expo Go (requires dev build)
export const MapView = RNMapView;
export const Marker = RNMarker;
export const Polyline = RNPolyline;
export const PROVIDER_GOOGLE = null;

/** Fallback view (unused on native, but exported for type compat) */
export function MapFallback({ children }: { children?: React.ReactNode }) {
  return (
    <View style={fallbackStyles.container}>
      <View style={fallbackStyles.content}>
        <Text style={fallbackStyles.icon}>🗺️</Text>
        <Text style={fallbackStyles.title}>Mapa indisponível</Text>
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
});
