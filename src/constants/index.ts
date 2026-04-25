// ============================================================
// App-wide Constants — Kinaja Entregador
// ============================================================

import type { OrderStatus } from '../types';

/** Order status labels in Portuguese */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceite',
  preparing: 'A Preparar',
  ready: 'Pronto',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

/** Order status colors */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#10B981',
  in_transit: '#EB2835',
  delivered: '#059669',
  cancelled: '#EF4444',
};

/** Vehicle type labels */
export const VEHICLE_TYPE_LABELS = {
  mota: 'Motocicleta',
  carro: 'Carro',
} as const;

/** SecureStore keys */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kinaja_auth_token',
  USER_DATA: 'kinaja_user_data',
  DRIVER_IS_ONLINE: 'kinaja_driver_is_online',
} as const;

/** Location tracking config */
export const LOCATION_CONFIG = {
  /** Interval between GPS updates sent to the API (milliseconds) */
  UPDATE_INTERVAL_MS: 5000,
  /** Minimum distance change to trigger update (meters) */
  DISTANCE_FILTER: 10,
  /** Route recalculation threshold (meters) */
  ROUTE_RECALC_THRESHOLD: 100,
} as const;

/** Map defaults — centered on Luanda, Angola */
export const MAP_DEFAULTS = {
  INITIAL_REGION: {
    latitude: -8.8383,
    longitude: 13.2344,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  },
} as const;

/** Currency formatting */
export const CURRENCY = {
  CODE: 'Kz',
  LOCALE: 'pt-AO',
} as const;
