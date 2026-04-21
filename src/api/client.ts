// ============================================================
// Axios HTTP Client — Kinaja Entregador
// Configured with auth interceptors and error handling
// ============================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@env';

// NOTE: authStore is imported lazily inside interceptors to avoid a
// require cycle (authStore → auth.ts → client.ts → authStore).

/** Create Axios instance with base configuration */
const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — auto-attach Bearer token
 * Lazily reads the token from Zustand auth store on every request
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lazy import to break the require cycle
    const { useAuthStore } = require('../store/authStore');
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor — handle 401 (auto logout) and format errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If unauthorized, clear auth state and redirect to login
    if (error.response?.status === 401) {
      // Lazy import to break the require cycle
      const { useAuthStore } = require('../store/authStore');
      const { logout } = useAuthStore.getState();
      await logout();
    }

    // Format error message for display
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Ocorreu um erro inesperado';

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: (error.response?.data as { errors?: Record<string, string[]> })?.errors,
      original: error,
    });
  }
);

export default apiClient;
