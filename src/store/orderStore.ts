// ============================================================
// Order Store — available orders, active order, status updates
// ============================================================

import { create } from 'zustand';
import * as driverApi from '../api/driver';
import * as ordersApi from '../api/orders';
import type { Order, OrderStatus } from '../types';

interface OrderState {
  /** List of available orders the driver can accept */
  availableOrders: Order[];
  /** Currently active order being delivered */
  activeOrder: Order | null;
  /** Completed order history for earnings */
  completedOrders: Order[];
  /** Loading states */
  isLoading: boolean;
  isUpdating: boolean;

  // Actions
  /** Fetch available orders from API */
  fetchAvailableOrders: () => Promise<void>;
  /** Accept an order and set it as active */
  acceptOrder: (orderId: number) => Promise<void>;
  /** Update the active order status */
  updateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  /** Set active order directly */
  setActiveOrder: (order: Order | null) => void;
  /** Fetch completed orders for earnings */
  fetchCompletedOrders: () => Promise<void>;
  /** Recover offline state */
  recoverSession: () => Promise<void>;
  /** Clear all order state (on logout) */
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  availableOrders: [],
  activeOrder: null,
  completedOrders: [],
  isLoading: false,
  isUpdating: false,

  fetchAvailableOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await driverApi.getAvailableOrders();
      set({ availableOrders: orders, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('[Orders] Failed to fetch available orders:', error);
    }
  },

  acceptOrder: async (orderId: number) => {
    set({ isUpdating: true });
    try {
      const response = await driverApi.acceptOrder(orderId);
      const acceptedOrder = response.data;

      set((state) => ({
        activeOrder: acceptedOrder,
        availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
        isUpdating: false,
      }));
    } catch (error) {
      set({ isUpdating: false });
      throw error;
    }
  },

  updateStatus: async (orderId: number, status: OrderStatus) => {
    set({ isUpdating: true });
    try {
      await ordersApi.updateOrderStatus(orderId, status);

      // If delivered, move to completed and clear active
      if (status === 'delivered') {
        set((state) => ({
          activeOrder: null,
          completedOrders: state.activeOrder
            ? [{ ...state.activeOrder, status }, ...state.completedOrders]
            : state.completedOrders,
          isUpdating: false,
        }));
      } else {
        // Update active order status in place
        set((state) => ({
          activeOrder: state.activeOrder
            ? { ...state.activeOrder, status }
            : null,
          isUpdating: false,
        }));
      }
    } catch (error) {
      set({ isUpdating: false });
      throw error;
    }
  },

  setActiveOrder: (order: Order | null) => {
    set({ activeOrder: order });
  },

  fetchCompletedOrders: async () => {
    try {
      const orders = await ordersApi.getOrders();
      const completed = orders.filter((o) => o.status === 'delivered');
      set({ completedOrders: completed });
    } catch (error) {
      console.error('[Orders] Failed to fetch completed orders:', error);
    }
  },

  recoverSession: async () => {
    set({ isLoading: true });
    try {
      const myOrders = await ordersApi.getOrders();
      
      // Find the first active delivery
      const active = myOrders.find((o) => 
        ['accepted', 'preparing', 'ready', 'in_transit'].includes(o.status)
      );

      // Attempt to immediately fetch available orders 
      let available: Order[] = [];
      try {
        available = await driverApi.getAvailableOrders();
      } catch (e) {
        console.warn('[Orders] Could not fetch available initially:', e);
      }

      set({ 
        activeOrder: active || null, 
        availableOrders: available,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('[Orders] Failed to recover session:', error);
    }
  },

  clearOrders: () => {
    set({
      availableOrders: [],
      activeOrder: null,
      completedOrders: [],
      isLoading: false,
      isUpdating: false,
    });
  },
}));
