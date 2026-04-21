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
    console.log('[Location] Emulating GPS permissions on Web for testing');
    return true;
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<LatLng | null> => {
    const mockPos = { latitude: -8.8383, longitude: 13.2344 };
    useDriverStore.getState().setLocation(mockPos);
    return mockPos;
  }, []);

  const startTracking = useCallback(async () => {
    const store = useDriverStore.getState();
    const mockPos = { latitude: -8.8383, longitude: 13.2344 };
    store.setLocation(mockPos);
    
    // Push the mock location directly to the API if online to simulate movement
    if (store.isOnline) {
      store.sendLocationToApi(mockPos);
    }
  }, []);

  const stopTracking = useCallback(() => {}, []);

  return {
    currentLocation,
    hasPermission: true,
    isTracking,
    requestPermissions,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
}
