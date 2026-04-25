// ============================================================
// ActiveOrderScreen — active delivery in progress
// Map with route + bottom sheet with delivery actions
// ============================================================

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import { MapView, Marker, Polyline, MapFallback } from '../../components/MapViewWrapper';
import ActionButton from '../../components/ActionButton';
import StatusBadge from '../../components/StatusBadge';
import RouteTimeline from '../../components/RouteTimeline';
import { formatCurrency } from '../../utils';
import { useOrders } from '../../hooks/useOrders';
import { useTracking } from '../../hooks/useTracking';
import { useDriverStore } from '../../store/driverStore';
import type { MainStackParamList } from '../../types';

type ActiveOrderNav = StackNavigationProp<MainStackParamList, 'ActiveOrder'>;
type ActiveOrderRoute = RouteProp<MainStackParamList, 'ActiveOrder'>;

export default function ActiveOrderScreen() {
  const navigation = useNavigation<ActiveOrderNav>();
  const route = useRoute<ActiveOrderRoute>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const currentLocation = useDriverStore((s) => s.currentLocation);
  const { activeOrder, isUpdating, updateStatus } = useOrders();
  const {
    route: routeData,
    currentLegRoute,
    restaurantLocation,
    clientLocation,
  } = useTracking();

  // Fit map to show all markers
  useEffect(() => {
    if (mapRef.current && currentLocation && MapView) {
      const coords = [currentLocation];
      if (restaurantLocation) coords.push(restaurantLocation);
      if (clientLocation) coords.push(clientLocation);

      if (coords.length > 1) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 40, bottom: 300, left: 40 },
          animated: true,
        });
      }
    }
  }, [currentLocation, restaurantLocation, clientLocation]);

  // Navigate back when order is completed
  useEffect(() => {
    if (!activeOrder) {
      navigation.goBack();
    }
  }, [activeOrder, navigation]);

  // Handle status update: pickup or deliver
  const handleStatusUpdate = useCallback(async () => {
    if (!activeOrder) return;

    const nextStatus =
      activeOrder.status === 'ready' || activeOrder.status === 'accepted' || activeOrder.status === 'preparing'
        ? 'in_transit'
        : 'delivered';

    const confirmMessage =
      nextStatus === 'in_transit'
        ? 'Confirmar que recolheu o pedido?'
        : 'Confirmar que entregou o pedido?';

    Alert.alert('Confirmar', confirmMessage, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await updateStatus(activeOrder.id, nextStatus);
          } catch (error: unknown) {
            const err = error as { message?: string };
            Alert.alert('Erro', err.message || 'Falha ao atualizar estado.');
          }
        },
      },
    ]);
  }, [activeOrder, updateStatus]);

  if (!activeOrder) return null;

  const isPickupPhase =
    activeOrder.status === 'ready' ||
    activeOrder.status === 'accepted' ||
    activeOrder.status === 'preparing';

  const actionLabel = isPickupPhase
    ? 'Recolher Pedido'
    : 'Entrega Concluída';

  const actionVariant = isPickupPhase ? 'primary' : 'success';

  // Render map or fallback
  const renderMap = () => {
    if (!MapView) {
      return <MapFallback />;
    }

    const RNMapView = MapView as React.ComponentType<any>;
    const RNMarker = Marker as React.ComponentType<any>;
    const RNPolyline = Polyline as React.ComponentType<any>;

    return (
      <RNMapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Driver marker */}
        {currentLocation && RNMarker && (
          <RNMarker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.driverDot}>
              <View style={styles.driverDotInner} />
            </View>
          </RNMarker>
        )}

        {/* Restaurant marker */}
        {restaurantLocation && RNMarker && (
          <RNMarker coordinate={restaurantLocation}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerEmoji}>🏪</Text>
            </View>
          </RNMarker>
        )}

        {/* Client marker */}
        {clientLocation && RNMarker && (
          <RNMarker coordinate={clientLocation}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerEmoji}>📍</Text>
            </View>
          </RNMarker>
        )}

        {/* Route polyline — driver to restaurant */}
        {isPickupPhase && RNPolyline && (
          <RNPolyline
            coordinates={
              routeData?.toRestaurant
                ? routeData.toRestaurant.coordinates
                : currentLocation && restaurantLocation
                  ? [currentLocation, restaurantLocation]
                  : []
            }
            strokeColor={COLORS.kinaRed}
            strokeWidth={4}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* Route polyline — restaurant to client */}
        {RNPolyline && (
          <RNPolyline
            coordinates={
              routeData?.toClient
                ? routeData.toClient.coordinates
                : restaurantLocation && clientLocation
                  ? [restaurantLocation, clientLocation]
                  : []
            }
            strokeColor={isPickupPhase ? COLORS.info : COLORS.success}
            strokeWidth={4}
            lineDashPattern={!routeData?.toClient ? [10, 5] : undefined}
          />
        )}
      </RNMapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Map taking upper portion (Clickable to expand to full navigation) */}
      <TouchableOpacity 
        style={styles.mapContainer}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MapTracking', { orderId: activeOrder.id })}
      >
        {renderMap()}

        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Click to navigate hint */}
        <View style={[styles.etaPill, { top: insets.top + 8 }]}>
          <Text style={styles.etaText}>
            {currentLegRoute ? `${currentLegRoute.duration} • Toque para Iniciar Trajeto` : 'Toque para Iniciar Trajeto'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom sheet with order info */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order header */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderTitle}>
                {isPickupPhase ? 'Indo para o restaurante' : 'Entregando ao cliente'}
              </Text>
              <Text style={styles.orderId}>Pedido #{activeOrder.id}</Text>
            </View>
            <StatusBadge status={activeOrder.status} size="md" />
          </View>

          {/* Route info */}
          <RouteTimeline
            pickupName={activeOrder.restaurant?.name || 'Restaurante'}
            pickupDetail={isPickupPhase ? '← Destino atual' : '✓ Recolhido'}
            deliveryName={activeOrder.delivery_address || 'Cliente'}
            deliveryDetail={!isPickupPhase ? '← Destino atual' : 'Próxima paragem'}
          />

          {/* Stats */}
          {routeData && (
            <View style={styles.statsRow}>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statValue}>
                  {routeData.totalDuration}
                </Text>
                <Text style={styles.statLabel}>Tempo total</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statValue}>
                  {routeData.totalDistance}
                </Text>
                <Text style={styles.statLabel}>Distância</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(activeOrder.delivery_fee)}
                </Text>
                <Text style={styles.statLabel}>Ganho</Text>
              </View>
            </View>
          )}

          {/* Action button */}
          <View style={styles.actionContainer}>
            <ActionButton
              title="🧭 Iniciar Trajeto"
              onPress={() => navigation.navigate('MapTracking', { orderId: activeOrder.id })}
              variant="secondary"
            />
            <View style={{ height: 12 }} />
            <ActionButton
              title={actionLabel}
              onPress={handleStatusUpdate}
              variant={actionVariant}
              isLoading={isUpdating}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  mapContainer: {
    flex: 1,
    minHeight: '45%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  etaPill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    ...SHADOWS.md,
  },
  etaText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  driverDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59,130,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.markerDriver,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  markerEmoji: {
    fontSize: 20,
  },
  bottomSheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADII['2xl'],
    borderTopRightRadius: RADII['2xl'],
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING['3xl'],
    maxHeight: '55%',
    ...SHADOWS.top,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  orderTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
  },
  orderId: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
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
    marginTop: 2,
  },
  actionContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
});
