// ============================================================
// MapTrackingScreen — full-screen map tracking view
// Shows all markers, polyline routes, ETA, distance
// ============================================================

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import { MapView, Marker, Polyline, MapFallback } from '../../components/MapViewWrapper';
import { useDriverStore } from '../../store/driverStore';
import { useTracking } from '../../hooks/useTracking';
import { useOrders } from '../../hooks/useOrders';

export default function MapTrackingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const currentLocation = useDriverStore((s) => s.currentLocation);
  const { activeOrder } = useOrders();
  const {
    route: routeData,
    currentLegRoute,
    isCalculating,
    restaurantLocation,
    clientLocation,
  } = useTracking();

  const isPickupPhase =
    activeOrder?.status === 'ready' ||
    activeOrder?.status === 'accepted' ||
    activeOrder?.status === 'preparing';

  // Fit map to all markers
  const fitToMarkers = useCallback(() => {
    if (!mapRef.current || !MapView) return;

    const coords = [];
    if (currentLocation) coords.push(currentLocation);
    if (restaurantLocation) coords.push(restaurantLocation);
    if (clientLocation) coords.push(clientLocation);

    if (coords.length > 1) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  }, [currentLocation, restaurantLocation, clientLocation]);

  useEffect(() => {
    const timer = setTimeout(fitToMarkers, 1000);
    return () => clearTimeout(timer);
  }, [fitToMarkers]);

  // Re-center on driver
  const handleRecenter = useCallback(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

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
      >
        {/* Driver marker (blue) */}
        {currentLocation && RNMarker && (
          <RNMarker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.driverMarker}>
              <View style={styles.driverPulse} />
              <View style={styles.driverDot} />
            </View>
          </RNMarker>
        )}

        {/* Restaurant marker (red) */}
        {restaurantLocation && RNMarker && (
          <RNMarker coordinate={restaurantLocation}>
            <View style={[styles.poiMarker, { backgroundColor: COLORS.kinaRed }]}>
              <Text style={styles.poiEmoji}>🏪</Text>
            </View>
          </RNMarker>
        )}

        {/* Client marker (green) */}
        {clientLocation && RNMarker && (
          <RNMarker coordinate={clientLocation}>
            <View style={[styles.poiMarker, { backgroundColor: COLORS.success }]}>
              <Text style={styles.poiEmoji}>🏠</Text>
            </View>
          </RNMarker>
        )}

        {/* Route: driver → restaurant (dashed red) */}
        {routeData?.toRestaurant && isPickupPhase && RNPolyline && (
          <RNPolyline
            coordinates={routeData.toRestaurant.coordinates}
            strokeColor={COLORS.kinaRed}
            strokeWidth={4}
            lineDashPattern={[10, 6]}
          />
        )}

        {/* Route: restaurant → client (solid blue/green) */}
        {routeData?.toClient && RNPolyline && (
          <RNPolyline
            coordinates={routeData.toClient.coordinates}
            strokeColor={isPickupPhase ? COLORS.info : COLORS.success}
            strokeWidth={4}
          />
        )}
      </RNMapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full-screen map */}
      {renderMap()}

      {/* Top bar: back + ETA */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {currentLegRoute && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaTitle}>
              {isPickupPhase ? 'Até ao restaurante' : 'Até ao cliente'}
            </Text>
            <View style={styles.etaRow}>
              <View style={styles.etaItem}>
                <Text style={styles.etaValue}>{currentLegRoute.duration}</Text>
                <Text style={styles.etaLabel}>ETA</Text>
              </View>
              <View style={styles.etaDivider} />
              <View style={styles.etaItem}>
                <Text style={styles.etaValue}>{currentLegRoute.distance}</Text>
                <Text style={styles.etaLabel}>Distância</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Fit all markers */}
        <TouchableOpacity style={styles.fab} onPress={fitToMarkers}>
          <Text style={styles.fabIcon}>📐</Text>
        </TouchableOpacity>

        {/* Re-center on driver */}
        <TouchableOpacity style={styles.fab} onPress={handleRecenter}>
          <Text style={styles.fabIcon}>🎯</Text>
        </TouchableOpacity>
      </View>

      {/* Route summary bar */}
      {routeData && (
        <View style={styles.routeSummary}>
          <View style={styles.routeSumItem}>
            <View style={[styles.routeSumDot, { backgroundColor: COLORS.kinaRed }]} />
            <Text style={styles.routeSumText}>Restaurante</Text>
          </View>
          <Text style={styles.routeSumArrow}>→</Text>
          <View style={styles.routeSumItem}>
            <View style={[styles.routeSumDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.routeSumText}>Cliente</Text>
          </View>
          <Text style={styles.routeSumTotal}>
            {routeData.totalDuration} • {routeData.totalDistance}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    gap: 12,
    zIndex: 10,
  },
  backBtn: {
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
  etaContainer: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  etaTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaItem: {
    alignItems: 'center',
    flex: 1,
  },
  etaValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
  },
  etaLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
  },
  etaDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.gray200,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    right: SPACING.lg,
    gap: 12,
    zIndex: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    fontSize: 22,
  },
  routeSummary: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.lg,
    right: 80,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.lg,
    zIndex: 10,
  },
  routeSumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeSumDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeSumText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  routeSumArrow: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
  },
  routeSumTotal: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.kinaRed,
    marginLeft: 'auto',
  },
  driverMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  driverDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.markerDriver,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
  },
  poiMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  poiEmoji: {
    fontSize: 18,
  },
});
