// ============================================================
// useLocation — Native GPS location tracking hook
// Uses expo-location watchPositionAsync with throttled API updates
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useDriverStore } from '../store/driverStore';
import { LOCATION_CONFIG } from '../constants';
import type { LatLng } from '../types';

/**
 * GPS location tracking hook (native only)
 * - Requests permissions
 * - Watches position with high accuracy
 * - Throttles API updates to every LOCATION_CONFIG.UPDATE_INTERVAL_MS
 */
export function useLocation() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const { currentLocation, setLocation, sendLocationToApi, isOnline } =
    useDriverStore();

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastApiUpdateRef = useRef<number>(0);

  /** Request location permissions */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foreground } =
        await Location.requestForegroundPermissionsAsync();

      if (foreground !== 'granted') {
        console.warn('[Location] Foreground permission denied');
        setHasPermission(false);
        return false;
      }

      // Also request background permissions for active deliveries
      try {
        await Location.requestBackgroundPermissionsAsync();
      } catch {
        // Background permissions may not be available in Expo Go
      }

      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('[Location] Permission request failed:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  /** Get current position once */
  const getCurrentPosition = useCallback(async (): Promise<LatLng | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLocation(coords);
      return coords;
    } catch (error) {
      console.error('[Location] Failed to get current position:', error);
      return null;
    }
  }, [setLocation]);

  /** Start watching position */
  const startTracking = useCallback(async () => {
    if (watchRef.current) return; // Already tracking

    const granted = await requestPermissions();
    if (!granted) return;

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: LOCATION_CONFIG.DISTANCE_FILTER,
        timeInterval: 3000, // Minimum 3 seconds between updates
      },
      (location) => {
        const coords: LatLng = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Always update local state
        setLocation(coords);

        // Throttle API updates
        const now = Date.now();
        if (now - lastApiUpdateRef.current >= LOCATION_CONFIG.UPDATE_INTERVAL_MS) {
          lastApiUpdateRef.current = now;
          if (isOnline) {
            sendLocationToApi(coords);
          }
        }
      }
    );

    setIsTracking(true);
  }, [requestPermissions, setLocation, sendLocationToApi, isOnline]);

  /** Stop watching position */
  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto-start/stop tracking based on online status
  useEffect(() => {
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isOnline, startTracking, stopTracking]);

  return {
    currentLocation,
    hasPermission,
    isTracking,
    requestPermissions,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
}
