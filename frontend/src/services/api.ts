import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authAPI = {
  login: (telegramInitData: string) => 
    api.post('/auth/login', { telegram_init_data: telegramInitData }),
  
  getUserProfile: () => 
    api.get('/users/profile'),
};

// Menu services
export const menuAPI = {
  getCategories: () => 
    api.get('/menu/categories'),
  
  getMenuItems: (params?: { category_id?: number; is_available?: boolean; search?: string }) => 
    api.get('/menu/', { params }),
  
  getMenuItem: (id: number) => 
    api.get(`/menu/items/${id}`),
};

// Cart services (these would be implemented in the backend as well)
export const cartAPI = {
  // These would be backend endpoints for cart persistence
  // For now, we'll handle cart in local storage
};

// Order services
export const orderAPI = {
  createOrder: (data: any) => 
    api.post('/orders/', data),
  
  getOrders: (params?: { status?: string; order_type?: string; date_from?: string; date_to?: string }) => 
    api.get('/orders/', { params }),
  
  getOrder: (id: number) => 
    api.get(`/orders/${id}`),
  
  cancelOrder: (id: number, reason?: string) => 
    api.post(`/orders/${id}/cancel`, { reason }),
};

// Delivery services
export const deliveryAPI = {
  calculateDelivery: (data: any) => 
    api.post('/delivery/calculate', data),
  
  getZones: () => 
    api.get('/delivery/zones'),
  
  getAddresses: () => 
    api.get('/delivery/addresses'),
  
  addAddress: (data: any) => 
    api.post('/delivery/addresses', data),
};

// Bonus services
export const bonusAPI = {
  getBonuses: () => 
    api.get('/bonuses/'),
  
  getReferralInfo: () => 
    api.post('/bonuses/referral'),
};

// Notification services
export const notificationAPI = {
  getNotifications: (params?: { read?: boolean; type?: string }) => 
    api.get('/notifications/', { params }),
  
  markAsRead: (id: number) => 
    api.post(`/notifications/${id}/read`),
};

export default api;