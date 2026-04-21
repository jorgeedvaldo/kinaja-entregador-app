// ============================================================
// API Endpoint Constants — maps to Laravel routes in AGENT.md
// ============================================================

/** Authentication endpoints (public) */
export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
} as const;

/** Driver-specific endpoints (require auth + driver role) */
export const DRIVER_ENDPOINTS = {
  PROFILE: '/driver/profile',
  TOGGLE_ONLINE: '/driver/toggle-online',
  UPDATE_LOCATION: '/driver/location',
  AVAILABLE_ORDERS: '/driver/available-orders',
  ACCEPT_ORDER: (orderId: number) => `/driver/orders/${orderId}/accept`,
} as const;

/** Order endpoints */
export const ORDER_ENDPOINTS = {
  LIST: '/orders',
  DETAILS: (orderId: number) => `/orders/${orderId}`,
  UPDATE_STATUS: (orderId: number) => `/orders/${orderId}/status`,
  CANCEL: (orderId: number) => `/orders/${orderId}/cancel`,
} as const;

/** Google Maps Directions API */
export const GOOGLE_MAPS = {
  DIRECTIONS_URL: 'https://maps.googleapis.com/maps/api/directions/json',
  DISTANCE_MATRIX_URL: 'https://maps.googleapis.com/maps/api/distancematrix/json',
} as const;
