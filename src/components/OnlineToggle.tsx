// ============================================================
// OnlineToggle — driver online/offline toggle
// Pill-shaped toggle with green/red border indication
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADII, SHADOWS } from '../constants/theme';

interface OnlineToggleProps {
  isOnline: boolean;
  isLoading?: boolean;
  onToggle: () => void;
}

export default function OnlineToggle({
  isOnline,
  isLoading = false,
  onToggle,
}: OnlineToggleProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: isOnline ? COLORS.success : COLORS.gray300,
        },
      ]}
      onPress={onToggle}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.kinaRed} />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOnline
                  ? COLORS.success
                  : COLORS.gray400,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isOnline
                    ? COLORS.success
                    : COLORS.gray400,
                },
              ]}
            />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADII.pill,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    ...SHADOWS.lg,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.pill,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textWhite,
    textTransform: 'uppercase',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
