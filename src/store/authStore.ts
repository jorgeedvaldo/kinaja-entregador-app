// ============================================================
// Auth Store — Zustand state management for authentication
// Handles login, logout, token persistence via SecureStore/localStorage
// ============================================================

import { create } from 'zustand';
import * as storage from '../utils/storage';
import * as authApi from '../api/auth';
import { STORAGE_KEYS } from '../constants';
import type { User } from '../types';

interface AuthState {
  /** Sanctum bearer token */
  token: string | null;
  /** Authenticated user data */
  user: User | null;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Whether initial token check has completed */
  isInitialized: boolean;

  // Actions
  /** Login with phone/email and password */
  login: (identifier: string, password: string) => Promise<void>;
  /** Logout — revoke token and clear state */
  logout: () => Promise<void>;
  /** Load saved token from storage on app start */
  loadToken: () => Promise<void>;
  /** Update user data */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(identifier, password);

      // Persist token
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);

      set({
        token: response.token,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Only call logout API if we have a token
      if (get().token) {
        await authApi.logout().catch(() => {
          // Ignore network errors during logout — still clear local state
        });
      }
    } finally {
      // Always clear local state and stored token
      await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
      set({
        token: null,
        user: null,
        isLoading: false,
      });
    }
  },

  loadToken: async () => {
    try {
      const savedToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (savedToken) {
        // Set token first so API calls use it
        set({ token: savedToken });

        // Validate token by fetching user profile
        try {
          const user = await authApi.getUser();
          set({ user, isInitialized: true });
        } catch {
          // Token is invalid — clear it
          await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
          set({ token: null, user: null, isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
