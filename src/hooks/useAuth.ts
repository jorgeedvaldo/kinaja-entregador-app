// ============================================================
// useAuth — authentication hook
// Convenience wrapper around the auth store
// ============================================================

import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDriverStore } from '../store/driverStore';
import { useOrderStore } from '../store/orderStore';

/**
 * Authentication hook providing login, logout, and auth state
 */
export function useAuth() {
  const {
    token,
    user,
    isLoading,
    isInitialized,
    login: storeLogin,
    logout: storeLogout,
    loadToken,
  } = useAuthStore();

  const resetDriver = useDriverStore((s) => s.reset);
  const clearOrders = useOrderStore((s) => s.clearOrders);

  /** Whether the user is currently authenticated */
  const isAuthenticated = !!token && !!user;

  /** Login with identifier (phone/email) and password */
  const login = useCallback(
    async (identifier: string, password: string) => {
      await storeLogin(identifier, password);
    },
    [storeLogin]
  );

  /** Logout and clear all app state */
  const logout = useCallback(async () => {
    await storeLogout();
    resetDriver();
    clearOrders();
  }, [storeLogout, resetDriver, clearOrders]);

  return {
    user,
    token,
    isLoading,
    isInitialized,
    isAuthenticated,
    login,
    logout,
    loadToken,
  };
}
