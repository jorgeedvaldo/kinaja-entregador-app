// ============================================================
// RouteTimeline — vertical pickup/delivery points display
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, FONT_SIZES, SPACING } from '../constants/theme';

interface RouteTimelineProps {
  pickupName: string;
  pickupDetail?: string;
  deliveryName: string;
  deliveryDetail?: string;
}

export default function RouteTimeline({
  pickupName,
  pickupDetail,
  deliveryName,
  deliveryDetail,
}: RouteTimelineProps) {
  return (
    <View style={styles.container}>
      {/* Dashed line connector */}
      <View style={styles.line} />

      {/* Pickup point */}
      <View style={styles.point}>
        <View
          style={[styles.dot, { backgroundColor: COLORS.kinaRed }]}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {pickupName}
          </Text>
          {pickupDetail && (
            <Text style={styles.detail}>{pickupDetail}</Text>
          )}
        </View>
      </View>

      {/* Delivery point */}
      <View style={[styles.point, { marginTop: SPACING.lg }]}>
        <View
          style={[styles.dot, { backgroundColor: COLORS.info }]}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {deliveryName}
          </Text>
          {deliveryDetail && (
            <Text style={styles.detail}>{deliveryDetail}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 28,
    paddingVertical: 8,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 5,
    top: 20,
    bottom: 12,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.bgCard,
    position: 'absolute',
    left: -28,
    top: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  detail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
