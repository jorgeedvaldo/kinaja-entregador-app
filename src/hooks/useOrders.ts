// ============================================================
// useOrders — orders management hook
// Handles fetching, accepting, and status updates
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useDriverStore } from '../store/driverStore';

/** Polling interval for available orders (milliseconds) */
const POLL_INTERVAL = 10000; // 10 seconds

/**
 * Orders hook with auto-polling for available orders when driver is online
 */
export function useOrders() {
  const {
    availableOrders,
    activeOrder,
    historyOrders,
    isLoading,
    isUpdating,
    fetchAvailableOrders,
    acceptOrder,
    updateStatus,
    setActiveOrder,
    fetchOrderHistory,
    recoverSession,
    checkActiveOrderStatus,
  } = useOrderStore();

  const isOnline = useDriverStore((s) => s.isOnline);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-poll for available orders when driver is online and has no active order
  useEffect(() => {
    if (isOnline && !activeOrder) {
      fetchAvailableOrders();
      pollRef.current = setInterval(() => {
        fetchAvailableOrders(true); // silent fetch
      }, POLL_INTERVAL);
    } else if (isOnline && activeOrder) {
      // Poll active order for status changes/cancellations
      pollRef.current = setInterval(() => {
        checkActiveOrderStatus();
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOnline, activeOrder, fetchAvailableOrders, checkActiveOrderStatus]);

  /** Accept an order — sets it as active and stops polling */
  const handleAcceptOrder = useCallback(
    async (orderId: number) => {
      await acceptOrder(orderId);
    },
    [acceptOrder]
  );

  /** Update order status (e.g., in_transit → delivered) */
  const handleUpdateStatus = useCallback(
    async (orderId: number, status: 'in_transit' | 'delivered') => {
      await updateStatus(orderId, status);
    },
    [updateStatus]
  );

  return {
    availableOrders,
    activeOrder,
    historyOrders,
    isLoading,
    isUpdating,
    acceptOrder: handleAcceptOrder,
    updateStatus: handleUpdateStatus,
    setActiveOrder,
    fetchAvailableOrders,
    fetchOrderHistory,
    recoverSession,
  };
}
