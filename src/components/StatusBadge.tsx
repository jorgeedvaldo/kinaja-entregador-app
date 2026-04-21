// ============================================================
// StatusBadge — order status chip with color coding
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, FONT_SIZES } from '../constants/theme';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants';
import type { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status] || COLORS.gray500;
  const label = ORDER_STATUS_LABELS[status] || status;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.pill,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
  },
});
