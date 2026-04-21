// ============================================================
// Driver Store — online/offline status & GPS location
// ============================================================

import { create } from 'zustand';
import * as driverApi from '../api/driver';
import type { LatLng } from '../types';

interface DriverState {
  /** Whether the driver is currently online */
  isOnline: boolean;
  /** Current GPS coordinates */
  currentLocation: LatLng | null;
  /** Loading state for toggle operation */
  isToggling: boolean;

  // Actions
  /** Toggle online/offline status via API */
  toggleOnline: () => Promise<void>;
  /** Set current GPS location & send to API */
  setLocation: (location: LatLng) => void;
  /** Send location to backend */
  sendLocationToApi: (location: LatLng) => Promise<void>;
  /** Reset driver state (on logout) */
  reset: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: false,
  currentLocation: null,
  isToggling: false,

  toggleOnline: async () => {
    set({ isToggling: true });
    try {
      const response = await driverApi.toggleOnline();
      set({
        isOnline: response.data.is_online,
        isToggling: false,
      });
    } catch (error) {
      set({ isToggling: false });
      throw error;
    }
  },

  setLocation: (location: LatLng) => {
    set({ currentLocation: location });
  },

  sendLocationToApi: async (location: LatLng) => {
    try {
      await driverApi.updateLocation(location.latitude, location.longitude);
    } catch (error) {
      // Silently fail GPS updates — don't disrupt the UX
      console.warn('[Driver] Failed to send location update:', error);
    }
  },

  reset: () => {
    set({
      isOnline: false,
      currentLocation: null,
      isToggling: false,
    });
  },
}));
