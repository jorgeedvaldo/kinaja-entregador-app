// ============================================================
// useLocation — Web platform stub (no GPS on web)
// ============================================================

import { useState, useCallback } from 'react';
import { useDriverStore } from '../store/driverStore';
import type { LatLng } from '../types';

/**
 * Web stub — GPS tracking is not available on web
 */
export function useLocation() {
  const [hasPermission] = useState<boolean>(false);
  const [isTracking] = useState<boolean>(false);

  const currentLocation = useDriverStore((s) => s.currentLocation);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.warn('[Location] GPS not available on web');
    return false;
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<LatLng | null> => {
    return null;
  }, []);

  const startTracking = useCallback(async () => {}, []);
  const stopTracking = useCallback(() => {}, []);

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
