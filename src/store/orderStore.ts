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
  /** History of all orders assigned to this driver */
  historyOrders: Order[];
  /** Loading states */
  isLoading: boolean;
  isUpdating: boolean;

  // Actions
  /** Fetch available orders from API (optionally silent) */
  fetchAvailableOrders: (silent?: boolean) => Promise<void>;
  /** Accept an order and set it as active */
  acceptOrder: (orderId: number) => Promise<void>;
  /** Update the active order status */
  updateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  /** Set active order directly */
  setActiveOrder: (order: Order | null) => void;
  /** Poll active order to check for unexpected cancellations */
  checkActiveOrderStatus: () => Promise<void>;
  /** Fetch full history of orders for this driver */
  fetchOrderHistory: () => Promise<void>;
  /** Recover offline state */
  recoverSession: () => Promise<void>;
  /** Clear all order state (on logout) */
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  availableOrders: [],
  activeOrder: null,
  historyOrders: [],
  isLoading: false,
  isUpdating: false,

  fetchAvailableOrders: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const orders = await driverApi.getAvailableOrders();
      set({ availableOrders: orders, isLoading: false });
    } catch (error) {
      if (!silent) set({ isLoading: false });
      console.error('[Orders] Failed to fetch available orders:', error);
    }
  },

  acceptOrder: async (orderId: number) => {
    set({ isUpdating: true });
    try {
      const response = await driverApi.acceptOrder(orderId);
      const acceptedOrder = (response as any).data || response;

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

      // If delivered, move to history and clear active
      if (status === 'delivered') {
        set((state) => ({
          activeOrder: null,
          historyOrders: state.activeOrder
            ? [{ ...state.activeOrder, status }, ...state.historyOrders]
            : state.historyOrders,
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

  checkActiveOrderStatus: async () => {
    const { activeOrder, setActiveOrder } = get();
    if (!activeOrder) return;

    try {
      const latestData = await ordersApi.getOrderDetails(activeOrder.id);
      if (latestData && latestData.status === 'cancelled') {
        // Order was cancelled externally
        setActiveOrder(null);
        // We trigger an alert asynchronously
        setTimeout(() => {
          import('react-native').then(({ Alert }) => {
            Alert.alert(
              'Encomenda Cancelada',
              `O utilizador ou restaurante cancelou a encomenda #${activeOrder.id}.`,
              [{ text: 'OK' }]
            );
          });
        }, 100);
      } else if (latestData && latestData.status !== activeOrder.status) {
        // Just sync other status changes quietly if any
        set({ activeOrder: { ...activeOrder, status: latestData.status } });
      }
    } catch (e) {
      console.warn('[Orders] Quiet poll for active order failed', e);
    }
  },

  fetchOrderHistory: async () => {
    try {
      // getOrders() fetches all orders associated with the signed-in driver
      const orders = await ordersApi.getOrders();
      set({ historyOrders: orders });
    } catch (error) {
      console.error('[Orders] Failed to fetch order history:', error);
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
        historyOrders: myOrders,
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
      historyOrders: [],
      isLoading: false,
      isUpdating: false,
    });
  },
}));
