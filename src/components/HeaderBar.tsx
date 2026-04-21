// ============================================================
// HeaderBar — floating header with profile & daily earnings
// Matches the Home screen HTML reference design
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS, RADII, SHADOWS, FONT_SIZES, SPACING } from '../constants/theme';
import { formatCurrency, getInitials } from '../utils';
import type { User } from '../types';

interface HeaderBarProps {
  user: User | null;
  todayEarnings?: number;
}

export default function HeaderBar({
  user,
  todayEarnings = 0,
}: HeaderBarProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user ? getInitials(user.name) : '?'}
          </Text>
        </View>
      </View>

      {/* Earnings info */}
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsLabel}>Hoje</Text>
        <Text style={styles.earningsValue}>
          {formatCurrency(todayEarnings)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADII.pill,
    paddingLeft: 6,
    paddingRight: SPACING.lg,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.lg,
  },
  avatarContainer: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.kinaRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgCard,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textWhite,
  },
  earningsContainer: {
    flexDirection: 'column',
  },
  earningsLabel: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    lineHeight: 12,
  },
  earningsValue: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.md,
    color: COLORS.kinaRed,
    lineHeight: 20,
  },
});
