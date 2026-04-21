// ============================================================
// Types & Interfaces — Kinaja Entregador App
// All TypeScript types matching the Laravel API schema
// ============================================================

/** User roles as defined in the backend */
export type UserRole = 'admin' | 'client' | 'driver' | 'restaurant_owner';

/** Vehicle types for delivery drivers */
export type VehicleType = 'mota' | 'carro';

/** Order status flow — strict sequential transitions */
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

// ----------------------------------------------------------
// Core Models
// ----------------------------------------------------------

/** Authenticated user from /api/user */
export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Driver profile from /api/driver/profile */
export interface Driver {
  id: number;
  user_id: number;
  vehicle_type: VehicleType;
  license_plate: string;
  current_lat: string | null;
  current_lng: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

/** Restaurant data */
export interface Restaurant {
  id: number;
  user_id: number;
  name: string;
  cuisine_type: string | null;
  cover_image: string | null;
  rating: string;
  prep_time_mins: number;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

/** Menu product */
export interface Product {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  is_available: boolean;
  category?: Category;
}

/** Menu category */
export interface Category {
  id: number;
  name: string;
}

/** Order item (line item within an order) */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  notes: string | null;
  product?: Product;
}

/** Full order object */
export interface Order {
  id: number;
  client_id: number;
  restaurant_id: number;
  driver_id: number | null;
  total_amount: string;
  delivery_fee: string;
  status: OrderStatus;
  delivery_address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  restaurant?: Restaurant;
  client?: User;
  driver?: Driver;
}

// ----------------------------------------------------------
// Location & Maps
// ----------------------------------------------------------

/** GPS coordinate pair */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Decoded route info from Google Directions API */
export interface RouteInfo {
  coordinates: LatLng[];
  distance: string;       // e.g. "4.7 km"
  distanceValue: number;  // meters
  duration: string;       // e.g. "18 min"
  durationValue: number;  // seconds
}

/** Full route with segments (driver→restaurant, restaurant→client) */
export interface FullRoute {
  toRestaurant: RouteInfo | null;
  toClient: RouteInfo | null;
  totalDistance: string;
  totalDuration: string;
}

// ----------------------------------------------------------
// API Responses
// ----------------------------------------------------------

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Auth login/register response */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ----------------------------------------------------------
// Navigation Types
// ----------------------------------------------------------

/** Stack nav param lists */
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ActiveOrder: { orderId: number };
  MapTracking: { orderId: number };
  OrderDetails: { orderId: number };
};

export type TabParamList = {
  Home: undefined;
  Earnings: undefined;
  Orders: undefined;
  Profile: undefined;
};
