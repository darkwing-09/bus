/* ============================================
   Shared TypeScript types for BusBook platform
   ============================================ */

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'user' | 'conductor' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Bus {
  id: string;
  operator_name: string;
  bus_number: string;
  bus_type: string;
  total_seats: number;
  amenities: Record<string, boolean>;
  layout_config: BusLayoutConfig;
  rating: number;
  image_url: string | null;
  created_at: string;
}

export interface BusLayoutConfig {
  rows: number;
  cols_left: number;
  cols_right: number;
  aisle_after: number;
  last_row_seats?: number;
  deck?: string;
}

export interface Seat {
  id: string;
  bus_id: string;
  seat_number: string;
  seat_type: 'window' | 'aisle' | 'middle';
  deck: 'lower' | 'upper';
  row_num: number;
  col_num: number;
  is_available: boolean;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_duration_minutes: number;
  stops: RouteStop[];
  is_active: boolean;
  created_at: string;
}

export interface RouteStop {
  name: string;
  km_from_origin: number;
  duration_minutes: number;
}

export interface Trip {
  id: string;
  bus_id: string;
  route_id: string;
  conductor_id: string | null;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: 'scheduled' | 'boarding' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TripSearchResult extends Trip {
  bus: Bus;
  route: Route;
}

export interface TripDetail extends TripSearchResult {
  available_seats: number;
  seats: Seat[];
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  seat_ids: string[];
  passenger_details: PassengerDetail[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  boarded: boolean;
  qr_code: string | null;
  created_at: string;
}

export interface BookingDetail extends Booking {
  trip?: TripSearchResult;
}

export interface PassengerDetail {
  name: string;
  age: number;
  gender: string;
  seat_id: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
}

export interface LocationUpdate {
  trip_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface SeatLockResponse {
  locked: string[];
  failed: string[];
  ttl_seconds: number;
}

export interface Analytics {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  total_buses: number;
  total_routes: number;
  total_trips: number;
  recent_bookings: Booking[];
}
