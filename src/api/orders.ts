// ============================================================
// Orders API — list, details, status updates
// ============================================================

import apiClient from './client';
import { ORDER_ENDPOINTS } from '../constants/api';
import type { ApiResponse, Order, OrderStatus } from '../types';

/**
 * List driver's orders
 * GET /api/orders
 */
export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<{ data: Order[] }>(ORDER_ENDPOINTS.LIST);
  return response.data.data || response.data as unknown as Order[];
}

/**
 * Get order details with items, restaurant, client
 * GET /api/orders/{id}
 */
export async function getOrderDetails(orderId: number): Promise<Order> {
  const response = await apiClient.get<{ data: Order }>(
    ORDER_ENDPOINTS.DETAILS(orderId)
  );
  return response.data.data || response.data as unknown as Order;
}

/**
 * Update order status (e.g., in_transit, delivered)
 * PATCH /api/orders/{id}/status
 */
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  const response = await apiClient.patch<ApiResponse<Order>>(
    ORDER_ENDPOINTS.UPDATE_STATUS(orderId),
    { status }
  );
  return response.data;
}

/**
 * Cancel an order
 * PATCH /api/orders/{id}/cancel
 */
export async function cancelOrder(orderId: number): Promise<ApiResponse<Order>> {
  const response = await apiClient.patch<ApiResponse<Order>>(
    ORDER_ENDPOINTS.CANCEL(orderId)
  );
  return response.data;
}
