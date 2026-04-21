// ============================================================
// EarningsScreen — driver earnings & revenue dashboard
// Today's earnings, weekly breakdown, delivery history
// ============================================================

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import { formatCurrency, formatDate, formatTime } from '../../utils';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { historyOrders, isLoading, fetchOrderHistory } = useOrders();

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Extract only delivered orders for earnings calculations
  const deliveredOrders = historyOrders.filter((o) => o.status === 'delivered');

  // Calculate today's earnings
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = deliveredOrders.filter(
    (o) => o.created_at.split('T')[0] === today
  );
  const todaysEarnings = todaysOrders.reduce(
    (sum, o) => sum + parseFloat(o.delivery_fee || '0'),
    0
  );

  // Calculate this week's earnings
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeksOrders = deliveredOrders.filter(
    (o) => new Date(o.created_at) >= weekAgo
  );
  const weeksEarnings = weeksOrders.reduce(
    (sum, o) => sum + parseFloat(o.delivery_fee || '0'),
    0
  );

  // Total all time
  const totalEarnings = deliveredOrders.reduce(
    (sum, o) => sum + parseFloat(o.delivery_fee || '0'),
    0
  );

  const handleRefresh = useCallback(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.kinaRed}
            colors={[COLORS.kinaRed]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carteira</Text>
          <Text style={styles.headerSubtitle}>
            Os seus ganhos de entregas
          </Text>
        </View>

        {/* Today's earnings hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Ganhos de Hoje</Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(todaysEarnings)}
          </Text>
          <Text style={styles.heroDeliveries}>
            {todaysOrders.length} entrega{todaysOrders.length !== 1 ? 's' : ''} concluída{todaysOrders.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(weeksEarnings)}
            </Text>
            <Text style={styles.statLabel}>Esta Semana</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(totalEarnings)}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {deliveredOrders.length}
            </Text>
            <Text style={styles.statLabel}>Entregas</Text>
          </View>
        </View>

        {/* Recent deliveries */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Entregas Recentes</Text>

          {deliveredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>
                Nenhuma entrega concluída ainda.
              </Text>
              <Text style={styles.emptySubtext}>
                Complete entregas para ver seus ganhos aqui.
              </Text>
            </View>
          ) : (
            deliveredOrders.slice(0, 20).map((order) => (
              <View key={order.id} style={styles.deliveryRow}>
                <View style={styles.deliveryIcon}>
                  <Text style={styles.deliveryEmoji}>✅</Text>
                </View>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryName}>
                    {order.restaurant?.name || `Pedido #${order.id}`}
                  </Text>
                  <Text style={styles.deliveryDate}>
                    {formatDate(order.created_at)} • {formatTime(order.created_at)}
                  </Text>
                </View>
                <Text style={styles.deliveryAmount}>
                  +{formatCurrency(order.delivery_fee)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bgCard,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: COLORS.kinaRed,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADII['2xl'],
    padding: SPACING['2xl'],
    alignItems: 'center',
    ...SHADOWS.red,
  },
  heroLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(251,239,184,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  heroAmount: {
    fontFamily: FONTS.black,
    fontSize: 42,
    color: COLORS.kinaCream,
    marginVertical: 4,
  },
  heroDeliveries: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  recentSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  deliveryEmoji: {
    fontSize: 18,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  deliveryDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  deliveryAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
