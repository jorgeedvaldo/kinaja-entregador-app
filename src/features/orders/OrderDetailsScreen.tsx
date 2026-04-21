// ============================================================
// OrderDetailsScreen — detailed order information
// Items, restaurant, client, status timeline, amounts
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import RouteTimeline from '../../components/RouteTimeline';
import { formatCurrency, formatTime, formatDate } from '../../utils';
import { getOrderDetails } from '../../api/orders';
import type { Order, MainStackParamList } from '../../types';

type DetailsRoute = RouteProp<MainStackParamList, 'OrderDetails'>;

export default function OrderDetailsScreen() {
  const route = useRoute<DetailsRoute>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrderDetails(orderId);
      setOrder(data);
    } catch (error) {
      console.error('[OrderDetails] Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.kinaRed} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Pedido não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Order header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
            <Text style={styles.orderDate}>
              {formatDate(order.created_at)} às {formatTime(order.created_at)}
            </Text>
          </View>
          <StatusBadge status={order.status} size="md" />
        </View>
      </View>

      {/* Route info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Rota de Entrega</Text>
        <RouteTimeline
          pickupName={order.restaurant?.name || 'Restaurante'}
          pickupDetail="Ponto de recolha"
          deliveryName={order.delivery_address || 'Endereço de entrega'}
          deliveryDetail="Ponto de entrega"
        />
      </View>

      {/* Order items */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Itens do Pedido</Text>
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemQty}>
                <Text style={styles.itemQtyText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.product?.name || `Produto #${item.product_id}`}
                </Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>📝 {item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(
                  parseFloat(item.unit_price) * item.quantity
                )}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>Sem itens detalhados</Text>
        )}
      </View>

      {/* Client info */}
      {order.client && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{order.client.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{order.client.phone}</Text>
          </View>
        </View>
      )}

      {/* Amounts */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Valores</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subtotal</Text>
          <Text style={styles.infoValue}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Taxa de Entrega</Text>
          <Text style={[styles.infoValue, { color: COLORS.kinaRed }]}>
            {formatCurrency(order.delivery_fee)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(
              parseFloat(order.total_amount) + parseFloat(order.delivery_fee)
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['5xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgLight,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  headerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII['2xl'],
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII['2xl'],
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemQty: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADII.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: SPACING.md,
  },
  itemQtyText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  itemNotes: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  noItems: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.xl,
    color: COLORS.kinaRed,
  },
});
