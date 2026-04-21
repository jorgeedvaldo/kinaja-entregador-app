// ============================================================
// AvailableOrdersScreen — unified history, active and new orders
// Premium Dashboard UI with horizontal filtering chips
// ============================================================

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
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

type FilterType = 'Todas' | 'Novas' | 'Ativa' | 'Concluídas' | 'Canceladas';
const FILTERS: FilterType[] = ['Todas', 'Novas', 'Ativa', 'Concluídas', 'Canceladas'];

export default function AvailableOrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OrdersNav>();
  const isOnline = useDriverStore((s) => s.isOnline);
  const [filter, setFilter] = useState<FilterType>('Todas');

  const {
    availableOrders,
    activeOrder,
    historyOrders,
    isLoading,
    isUpdating,
    acceptOrder,
    fetchAvailableOrders,
    fetchOrderHistory,
  } = useOrders();

  // Combine all orders to ensure no duplicates
  const allOrdersMap = useMemo(() => {
    const map = new Map<number, Order>();

    // Load history first
    historyOrders.forEach((o) => map.set(o.id, o));
    // Load available (ensuring they take precedence if duplicate)
    availableOrders.forEach((o) => map.set(o.id, o));
    // Load active (highest precedence)
    if (activeOrder) map.set(activeOrder.id, activeOrder);

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [availableOrders, historyOrders, activeOrder]);

  const displayOrders = useMemo(() => {
    return allOrdersMap.filter((order) => {
      if (filter === 'Todas') return true;
      if (filter === 'Novas') return order.driver_id === null; // unassigned
      if (filter === 'Ativa') return order.id === activeOrder?.id;
      if (filter === 'Concluídas') return order.status === 'delivered';
      if (filter === 'Canceladas') return order.status === 'cancelled';
      return true;
    });
  }, [allOrdersMap, filter, activeOrder]);

  const handleRefresh = useCallback(() => {
    fetchAvailableOrders();
    fetchOrderHistory();
  }, [fetchAvailableOrders, fetchOrderHistory]);

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
      const isAvailable = !item.driver_id && item.status !== 'cancelled';
      const isCancelled = item.status === 'cancelled';
      const isCompleted = item.status === 'delivered';
      const isActive = activeOrder?.id === item.id;

      // Card custom styling based on status
      const cardStyles = [
        styles.orderCard,
        isCancelled && styles.orderCardCancelled,
        isActive && styles.orderCardActive,
      ];

      return (
        <TouchableOpacity
          style={cardStyles}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          activeOpacity={0.7}
        >
          {/* Glowing highlight for available orders */}
          {isAvailable && <View style={styles.availableHighlight} />}

          {/* Top row: order # + status */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={[styles.orderId, isCancelled && styles.textMuted]}>
                Pedido #{item.id}
              </Text>
              <Text style={[styles.orderTime, isCancelled && styles.textMuted]}>
                {timeAgo(item.created_at)}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {/* Route timeline */}
          <View style={{ opacity: isCancelled ? 0.6 : 1 }}>
            <RouteTimeline
              pickupName={item.restaurant?.name || 'Restaurante'}
              pickupDetail="Recolha"
              deliveryName={item.delivery_address || 'Endereço do cliente'}
              deliveryDetail="Entrega"
            />
          </View>

          {/* Bottom row: price + action */}
          <View style={[styles.orderFooter, isCancelled && styles.footerMuted]}>
            <View>
              <Text style={styles.feeLabel}>Taxa de entrega</Text>
              <Text
                style={[
                  styles.feeValue,
                  isCancelled ? styles.feeValueCancelled : isCompleted ? styles.feeValueSuccess : undefined,
                ]}
              >
                {formatCurrency(item.delivery_fee)}
              </Text>
            </View>

            {isAvailable && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
                disabled={isUpdating}
              >
                <Text style={styles.acceptButtonText}>
                  {isUpdating ? '…' : 'ACEITAR'}
                </Text>
              </TouchableOpacity>
            )}

            {isActive && (
              <TouchableOpacity
                style={styles.activeButton}
                onPress={() => navigation.navigate('ActiveOrder', { orderId: item.id })}
              >
                <Text style={styles.activeButtonText}>Ver Mapa →</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, handleAcceptOrder, isUpdating, activeOrder]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>
          Nenhum pedido encontrado.
        </Text>
        <Text style={styles.emptySubtitle}>
          {filter === 'Todas' ? 'Os pedidos irão aparecer aqui.' : 'Nenhum pedido nesta categoria.'}
        </Text>
      </View>
    ),
    [filter]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel de Tarefas</Text>
        <Text style={styles.headerSubtitle}>
          Contole geral sobre os seus pedidos
        </Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders list */}
      <FlatList
        data={displayOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          displayOrders.length === 0 && styles.listEmpty,
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
  filterContainer: {
    backgroundColor: COLORS.bgCard,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.gray200,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.kinaRed,
    borderColor: COLORS.danger,
    ...SHADOWS.sm,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.kinaCream,
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
    position: 'relative',
    overflow: 'hidden',
  },
  orderCardCancelled: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  orderCardActive: {
    borderColor: COLORS.info,
    borderWidth: 2,
  },
  availableHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 6,
    backgroundColor: COLORS.kinaRed,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  orderTime: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  textMuted: {
    color: COLORS.textTertiary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerMuted: {
    borderTopColor: COLORS.border,
  },
  feeLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
  },
  feeValue: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.xl,
    color: COLORS.kinaRed,
  },
  feeValueCancelled: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  feeValueSuccess: {
    color: COLORS.success,
  },
  acceptButton: {
    backgroundColor: COLORS.kinaRed,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADII.md,
    ...SHADOWS.red,
  },
  acceptButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.kinaCream,
    textTransform: 'uppercase',
  },
  activeButton: {
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  activeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.infoText,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
