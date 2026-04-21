// ============================================================
// AvailableOrdersScreen — list of available orders
// Pull-to-refresh FlatList with order cards
// ============================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import RouteTimeline from '../../components/RouteTimeline';
import { formatCurrency, timeAgo } from '../../utils';
import { useOrders } from '../../hooks/useOrders';
import { useDriverStore } from '../../store/driverStore';
import type { Order, MainStackParamList } from '../../types';

type OrdersNav = StackNavigationProp<MainStackParamList>;

export default function AvailableOrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OrdersNav>();
  const isOnline = useDriverStore((s) => s.isOnline);
  const {
    availableOrders,
    completedOrders,
    isLoading,
    isUpdating,
    acceptOrder,
    fetchAvailableOrders,
    fetchCompletedOrders,
  } = useOrders();

  // Combine available and completed orders for the list
  const allOrders = [...availableOrders, ...completedOrders];

  const handleRefresh = useCallback(() => {
    fetchAvailableOrders();
    fetchCompletedOrders();
  }, [fetchAvailableOrders, fetchCompletedOrders]);

  const handleAcceptOrder = useCallback(
    async (orderId: number) => {
      try {
        await acceptOrder(orderId);
      } catch (error: unknown) {
        const err = error as { message?: string };
        Alert.alert('Erro', err.message || 'Falha ao aceitar pedido.');
      }
    },
    [acceptOrder]
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isAvailable =
        item.status === 'pending' ||
        item.status === 'ready' ||
        item.status === 'accepted' ||
        item.status === 'preparing';

      return (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          activeOpacity={0.7}
        >
          {/* Top row: order # + status */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Pedido #{item.id}</Text>
              <Text style={styles.orderTime}>{timeAgo(item.created_at)}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {/* Route timeline */}
          <RouteTimeline
            pickupName={item.restaurant?.name || 'Restaurante'}
            pickupDetail="Recolha"
            deliveryName={item.delivery_address || 'Endereço do cliente'}
            deliveryDetail="Entrega"
          />

          {/* Bottom row: price + action */}
          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.feeLabel}>Taxa de entrega</Text>
              <Text style={styles.feeValue}>
                {formatCurrency(item.delivery_fee)}
              </Text>
            </View>

            {isAvailable && !item.driver_id && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
                disabled={isUpdating}
              >
                <Text style={styles.acceptButtonText}>
                  {isUpdating ? '…' : 'Aceitar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, handleAcceptOrder, isUpdating]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>
          {isOnline
            ? 'Nenhum pedido disponível'
            : 'Você está offline'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isOnline
            ? 'Novos pedidos aparecerão aqui automaticamente.'
            : 'Fique online para ver pedidos disponíveis.'}
        </Text>
      </View>
    ),
    [isOnline]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumo de Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          {availableOrders.length} disponível(eis)
        </Text>
      </View>

      {/* Orders list */}
      <FlatList
        data={allOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          allOrders.length === 0 && styles.listEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.kinaRed}
            colors={[COLORS.kinaRed]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  listEmpty: {
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII['2xl'],
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  orderTime: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  feeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
  },
  feeValue: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.xl,
    color: COLORS.kinaRed,
  },
  acceptButton: {
    backgroundColor: COLORS.kinaRed,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    ...SHADOWS.red,
  },
  acceptButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.kinaCream,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
