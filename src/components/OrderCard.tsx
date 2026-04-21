// ============================================================
// OrderCard — new delivery order card (bottom sheet overlay)
// Matches the HTML reference with time bar, route, stats, actions
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, FONTS, RADII, SHADOWS, SPACING, FONT_SIZES } from '../constants/theme';
import { formatCurrency } from '../utils';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: number) => void;
  onDecline: (orderId: number) => void;
  isLoading?: boolean;
}

/** Countdown timer duration in seconds */
const COUNTDOWN_DURATION = 15;

export default function OrderCard({
  order,
  onAccept,
  onDecline,
  isLoading = false,
}: OrderCardProps) {
  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  // Timer bar animation
  const timerWidth = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide up on mount
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Timer bar countdown
    Animated.timing(timerWidth, {
      toValue: 0,
      duration: COUNTDOWN_DURATION * 1000,
      useNativeDriver: false,
    }).start();
  }, [slideAnim, opacityAnim, timerWidth]);

  const deliveryFee = parseFloat(order.delivery_fee || '0');
  const restaurantName = order.restaurant?.name || 'Restaurante';
  const deliveryAddress = order.delivery_address || 'Endereço de entrega';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.card}>
        {/* Timer bar at top */}
        <View style={styles.timerBarBg}>
          <Animated.View
            style={[
              styles.timerBarFill,
              {
                width: timerWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Header — "Nova Entrega" + earnings */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Pulsing indicator dot */}
            <View style={styles.pulseContainer}>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.headerTitle}>Nova Entrega</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.earningsAmount}>
              <Text style={styles.earningsCurrency}>Kz</Text>{' '}
              {deliveryFee.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            </Text>
            <Text style={styles.earningsLabel}>Ganhos Estimados</Text>
          </View>
        </View>

        {/* Route: Restaurant → Client */}
        <View style={styles.routeContainer}>
          {/* Dashed line connector */}
          <View style={styles.routeLine} />

          {/* Pickup point */}
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.kinaRed }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{restaurantName}</Text>
              <Text style={styles.routeDetail}>Recolha</Text>
            </View>
          </View>

          {/* Delivery point */}
          <View style={[styles.routePoint, { marginTop: 16 }]}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.info }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{deliveryAddress}</Text>
              <Text style={styles.routeDetail}>Entrega</Text>
            </View>
          </View>
        </View>

        {/* Stats row: Time, Distance, Items */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {order.items?.length || '--'}
            </Text>
            <Text style={styles.statLabel}>Itens</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => onDecline(order.id)}
            disabled={isLoading}
          >
            <Text style={styles.declineText}>Recusar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept(order.id)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptText}>
              {isLoading ? 'A aceitar...' : 'ACEITAR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    zIndex: 20,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII['2xl'],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  timerBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.gray200,
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: COLORS.kinaRed,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseContainer: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.kinaRed,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.kinaRed,
  },
  earningsCurrency: {
    fontSize: FONT_SIZES.sm,
  },
  earningsLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  routeContainer: {
    paddingLeft: 24,
    paddingVertical: 8,
    marginBottom: 20,
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    left: 5,
    top: 20,
    bottom: 12,
    width: 1.5,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.bgCard,
    position: 'absolute',
    left: -24,
    top: 4,
    ...SHADOWS.sm,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  routeDetail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: RADII.md,
    backgroundColor: COLORS.kinaRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.red,
  },
  acceptText: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.xl,
    color: COLORS.kinaCream,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
