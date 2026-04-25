// ============================================================
// useTracking — route calculation & tracking hook
// Combines location + Google Maps directions for active orders
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDriverStore } from '../store/driverStore';
import { useOrderStore } from '../store/orderStore';
import { getFullRoute, getDirections } from '../api/maps';
import { LOCATION_CONFIG } from '../constants';
import type { FullRoute, LatLng, RouteInfo } from '../types';

/**
 * Route tracking hook for active deliveries
 * - Calculates route: driver → restaurant → client
 * - Recalculates when driver moves significantly
 * - Provides ETA and distance for UI display
 */
export function useTracking() {
  const [route, setRoute] = useState<FullRoute | null>(null);
  const [currentLegRoute, setCurrentLegRoute] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const currentLocation = useDriverStore((s) => s.currentLocation);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const lastCalcLocation = useRef<LatLng | null>(null);

  /** Get restaurant coordinates from the active order */
  const getRestaurantLocation = useCallback((): LatLng | null => {
    // Note: In production, the restaurant model should include lat/lng
    // For now, we'll use a fallback or the restaurant data if available
    if (!activeOrder?.restaurant) return null;

    // If restaurant has coordinates, use them
    // Otherwise use a default (this should be extended in the backend)
    return {
      latitude: -8.838,
      longitude: 13.234,
    };
  }, [activeOrder]);

  /** Get client delivery coordinates */
  const getClientLocation = useCallback((): LatLng | null => {
    // If order has coordinates, use them
    if (activeOrder?.latitude && activeOrder?.longitude) {
      return {
        latitude: Number(activeOrder.latitude),
        longitude: Number(activeOrder.longitude),
      };
    }

    // Fallback if client has no coordinates (for testing/demo)
    return {
      latitude: -8.845,
      longitude: 13.240,
    };
  }, [activeOrder]);

  /**
   * Calculate the full route (driver → restaurant → client)
   * Separated into two legs for the delivery flow
   */
  const calculateRoute = useCallback(async () => {
    if (!activeOrder) return;

    // Use a default driver location (Luanda center) if GPS is not yet available
    const driverLocation = currentLocation || { latitude: -8.839, longitude: 13.220 };
    const restaurantLocation = getRestaurantLocation();
    const clientLocation = getClientLocation();

    if (!restaurantLocation || !clientLocation) return;

    setIsCalculating(true);

    try {
      const fullRoute = await getFullRoute(
        driverLocation,
        restaurantLocation,
        clientLocation
      );

      setRoute(fullRoute);

      // Set current leg based on order status
      if (
        activeOrder.status === 'accepted' ||
        activeOrder.status === 'preparing' ||
        activeOrder.status === 'ready'
      ) {
        // Driver heading to restaurant
        setCurrentLegRoute(fullRoute.toRestaurant);
      } else if (activeOrder.status === 'in_transit') {
        // Driver heading to client
        setCurrentLegRoute(fullRoute.toClient);
      }

      lastCalcLocation.current = currentLocation;
    } catch (error) {
      console.error('[Tracking] Route calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [currentLocation, activeOrder, getRestaurantLocation, getClientLocation]);

  /** Check if route needs recalculation based on distance threshold */
  const shouldRecalculate = useCallback((): boolean => {
    // If no GPS, we can't recalculate distance, so don't loop
    if (!currentLocation) return false;
    
    if (!lastCalcLocation.current) return true;

    const distance = getDistanceBetween(
      currentLocation,
      lastCalcLocation.current
    );

    return distance > LOCATION_CONFIG.ROUTE_RECALC_THRESHOLD;
  }, [currentLocation]);

  // Recalculate route when driver moves significantly or order status changes
  useEffect(() => {
    if (activeOrder) {
      if (!route || shouldRecalculate()) {
        calculateRoute();
      }
    } else {
      // Clear route when no active order
      setRoute(null);
      setCurrentLegRoute(null);
      lastCalcLocation.current = null;
    }
  }, [activeOrder?.status, currentLocation, activeOrder, route, shouldRecalculate, calculateRoute]);

  return {
    route,
    currentLegRoute,
    isCalculating,
    calculateRoute,
    restaurantLocation: getRestaurantLocation(),
    clientLocation: getClientLocation(),
  };
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @returns distance in meters
 */
function getDistanceBetween(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
