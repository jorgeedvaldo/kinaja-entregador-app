// ============================================================
// Driver API — online toggle, location, available orders
// ============================================================

import apiClient from './client';
import { DRIVER_ENDPOINTS } from '../constants/api';
import type { ApiResponse, Driver, Order } from '../types';

/**
 * Toggle driver online/offline status
 * PATCH /api/driver/toggle-online
 */
export async function toggleOnline(): Promise<ApiResponse<Driver>> {
  const response = await apiClient.patch<ApiResponse<Driver>>(
    DRIVER_ENDPOINTS.TOGGLE_ONLINE
  );
  return response.data;
}

/**
 * Update driver GPS location
 * PATCH /api/driver/location
 */
export async function updateLocation(
  currentLat: number,
  currentLng: number
): Promise<ApiResponse<Driver>> {
  const response = await apiClient.patch<ApiResponse<Driver>>(
    DRIVER_ENDPOINTS.UPDATE_LOCATION,
    {
      current_lat: currentLat,
      current_lng: currentLng,
    }
  );
  return response.data;
}

/**
 * Get available orders for pickup (ready status)
 * GET /api/driver/available-orders
 */
export async function getAvailableOrders(): Promise<Order[]> {
  const response = await apiClient.get<{ data: Order[] }>(
    DRIVER_ENDPOINTS.AVAILABLE_ORDERS
  );
  return response.data.data || response.data as unknown as Order[];
}

/**
 * Accept an order for delivery
 * PATCH /api/driver/orders/{id}/accept
 */
export async function acceptOrder(orderId: number): Promise<ApiResponse<Order>> {
  const response = await apiClient.patch<ApiResponse<Order>>(
    DRIVER_ENDPOINTS.ACCEPT_ORDER(orderId)
  );
  return response.data;
}

/**
 * Create driver profile
 * POST /api/driver/profile
 */
export async function createDriverProfile(data: {
  vehicle_type: string;
  license_plate: string;
}): Promise<ApiResponse<Driver>> {
  const response = await apiClient.post<ApiResponse<Driver>>(
    DRIVER_ENDPOINTS.PROFILE,
    data
  );
  return response.data;
}

/**
 * Update driver profile
 * PUT /api/driver/profile
 */
export async function updateDriverProfile(data: {
  vehicle_type?: string;
  license_plate?: string;
}): Promise<ApiResponse<Driver>> {
  const response = await apiClient.put<ApiResponse<Driver>>(
    DRIVER_ENDPOINTS.PROFILE,
    data
  );
  return response.data;
}
