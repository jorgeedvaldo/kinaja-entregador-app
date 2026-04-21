// ============================================================
// Auth API — login, logout, get user profile
// ============================================================

import apiClient from './client';
import { AUTH_ENDPOINTS } from '../constants/api';
import type { AuthResponse, User } from '../types';

/**
 * Login with phone/email + password
 * POST /api/login
 */
export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
    identifier,
    password,
  });
  return response.data;
}

/**
 * Logout — revoke current token
 * POST /api/logout
 */
export async function logout(): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Get authenticated user profile
 * GET /api/user
 */
export async function getUser(): Promise<User> {
  const response = await apiClient.get<User>(AUTH_ENDPOINTS.USER);
  return response.data;
}
