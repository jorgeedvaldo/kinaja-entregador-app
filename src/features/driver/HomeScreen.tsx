// ============================================================
// HomeScreen — main driver map view
// Full-screen Google Map with floating header, online toggle,
// driver marker, and order card overlay
// ============================================================

import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SHADOWS, SPACING } from '../../constants/theme';
import { MAP_DEFAULTS } from '../../constants';
import { MapView, Marker, MapFallback } from '../../components/MapViewWrapper';
import HeaderBar from '../../components/HeaderBar';
import OnlineToggle from '../../components/OnlineToggle';
import OrderCard from '../../components/OrderCard';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useOrders } from '../../hooks/useOrders';
import { useDriverStore } from '../../store/driverStore';
import type { MainStackParamList } from '../../types';

type HomeNav = StackNavigationProp<MainStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentLocation, requestPermissions, getCurrentPosition } = useLocation();
  const { isOnline, isToggling, toggleOnline } = useDriverStore();
  const {
    availableOrders,
    activeOrder,
    isUpdating,
    acceptOrder,
    recoverSession,
  } = useOrders();

  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Request location permissions on mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestPermissions().then(() => {
        getCurrentPosition();
      });
    }
  }, [requestPermissions, getCurrentPosition]);

  // Recover offline state on mount
  useEffect(() => {
    recoverSession();
  }, [recoverSession]);

  // Navigate to active order when one is accepted, and force online status
  useEffect(() => {
    if (activeOrder) {
      if (!isOnline) {
        useDriverStore.setState({ isOnline: true });
      }
      navigation.navigate('ActiveOrder', { orderId: activeOrder.id });
    }
  }, [activeOrder, navigation, isOnline]);

  // Center map on driver location
  const handleCenterMap = useCallback(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  // Toggle online/offline
  const handleToggleOnline = useCallback(async () => {
    try {
      await toggleOnline();
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Erro', err.message || 'Falha ao alterar estado online.');
    }
  }, [toggleOnline]);

  // Accept order
  const handleAcceptOrder = useCallback(async (orderId: number) => {
    try {
      await acceptOrder(orderId);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Erro', err.message || 'Falha ao aceitar pedido.');
    }
  }, [acceptOrder]);

  // Decline order (dismiss from list)
  const handleDeclineOrder = useCallback((_orderId: number) => {
    // In production, this would notify the backend
    // For now, we just dismiss the card
  }, []);

  // Show the first available order as the overlay card
  const pendingOrder = availableOrders.length > 0 ? availableOrders[0] : null;

  const initialRegion = currentLocation
    ? {
        ...currentLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : MAP_DEFAULTS.INITIAL_REGION;

  // Render map content — either native MapView or web fallback
  const renderMap = () => {
    if (!MapView) {
      return <MapFallback />;
    }

    const RNMapView = MapView as React.ComponentType<any>;
    const RNMarker = Marker as React.ComponentType<any>;

    return (
      <RNMapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={() => setMapReady(true)}
      >
        {/* Driver marker — blue dot */}
        {currentLocation && RNMarker && (
          <RNMarker
            coordinate={currentLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverMarker}>
              <View style={styles.driverMarkerPulse} />
              <View style={styles.driverMarkerDot} />
            </View>
          </RNMarker>
        )}
      </RNMapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full-screen Map */}
      {renderMap()}

      {/* Dark overlay when offline */}
      {!isOnline && (
        <View style={styles.offlineOverlay}>
          <Text style={styles.offlineText}>
            Fique online para receber pedidos
          </Text>
        </View>
      )}

      {/* Floating header */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <HeaderBar user={user} todayEarnings={0} />
        <OnlineToggle
          isOnline={isOnline}
          isLoading={isToggling}
          onToggle={handleToggleOnline}
        />
      </View>

      {/* Center map FAB */}
      <TouchableOpacity
        style={[
          styles.centerFab,
          { bottom: pendingOrder ? 360 : 100 },
        ]}
        onPress={handleCenterMap}
        activeOpacity={0.8}
      >
        <Text style={styles.centerFabIcon}>🎯</Text>
      </TouchableOpacity>

      {/* New order card overlay */}
      {pendingOrder && isOnline && !activeOrder && (
        <OrderCard
          order={pendingOrder}
          onAccept={handleAcceptOrder}
          onDecline={handleDeclineOrder}
          isLoading={isUpdating}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray200,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
  },
  driverMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  driverMarkerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.markerDriver,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
    ...SHADOWS.md,
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  offlineText: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.textWhite,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  centerFab: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...SHADOWS.lg,
  },
  centerFabIcon: {
    fontSize: 22,
  },
});
