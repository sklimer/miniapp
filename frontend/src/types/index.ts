// User types
export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  is_admin: boolean;
  is_blocked: boolean;
  bonus_points: number;
  total_spent: number;
  created_at: string;
  orders_count?: number;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

// Menu types
export interface MenuItemVariation {
  id: number;
  name: string;
  price_difference: number;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_on_stop_list: boolean;
  preparation_time: number;
  created_at: string;
  variations: MenuItemVariation[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  position: number;
  is_active: boolean;
  item_count?: number;
  items?: MenuItem[];
}

export interface MenuResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
  message: string;
}

// Cart types
export interface CartItem {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  variation_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

// Order types
export interface OrderItem {
  menu_item_id: number;
  variation_id?: number;
  quantity: number;
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  building: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface CreateOrderRequest {
  order_type: 'delivery' | 'pickup';
  items: OrderItem[];
  delivery_address?: DeliveryAddress;
  notes?: string;
  payment_method: 'yookassa' | 'cash';
  bonus_to_use?: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  order_type: 'delivery' | 'pickup';
  delivery_address?: any;
  delivery_coordinates?: {
    lat: number;
    lon: number;
  };
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_cost: number;
  discount_amount: number;
  bonus_used: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items: OrderItemResponse[];
  estimated_delivery_time?: string;
}

export interface OrderItemResponse {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  variation_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
  message: string;
}

// Delivery types
export interface DeliveryCalculationRequest {
  coordinates: {
    lat: number;
    lon: number;
  };
  order_value: number;
}

export interface DeliveryCalculationResponse {
  success: boolean;
  data: {
    delivery_cost: number;
    distance_km: number;
    estimated_time: number;
    is_deliverable: boolean;
    free_delivery: boolean;
  };
  message: string;
}

// Bonus types
export interface Bonus {
  id: number;
  type: 'registration' | 'cashback' | 'referral' | 'manual';
  amount: number;
  description: string;
  expires_at?: string;
  is_used: boolean;
  created_at: string;
}

export interface BonusResponse {
  success: boolean;
  data: {
    total_bonus_points: number;
    available_bonus_points: number;
    pending_bonus_points: number;
    bonuses: Bonus[];
  };
  message: string;
}

// Referral types
export interface ReferralResponse {
  success: boolean;
  data: {
    referral_code: string;
    referral_link: string;
    bonus_per_referral: number;
    referrals_count: number;
    total_earned: number;
  };
  message: string;
}

// Notification types
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  sent_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  message: string;
}