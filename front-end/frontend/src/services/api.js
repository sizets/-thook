// services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true,
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.error === 'Token is not valid or expired') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic request handler
export const request = async (method, url, data = {}, config = {}) => {
    try {
        const res = await api({
            method,
            url,
            data,
            ...config,
        });
        return res.data;
    } catch (err) {
        // Optionally log or format the error
        throw err.response?.data || { message: err.message };
    }
};

// Product/Tablet APIs
export const getTablets = () => request('GET', '/tablets');
export const getBestsellers = () => request('GET', '/tablets/bestsellers');

// Cart APIs
export const addToCart = (tabletId, size, quantity = 1) =>
    request('POST', '/cart/add', { tabletId, size, quantity });
export const getCart = () => request('GET', '/cart');
export const updateCartItem = (tabletId, size, quantity) =>
    request('PUT', '/cart/update', { tabletId, size, quantity });
export const clearCart = () => request('DELETE', '/cart/clear');
export const checkout = (orderData) => request('POST', '/checkout', orderData);

// Order APIs
export const getUserOrders = () => request('GET', '/orders');
export const getOrderById = (orderId) => request('GET', `/orders/${orderId}`);
export const updateOrderStatus = (orderId, status) => request('PUT', `/orders/${orderId}/status`, { status });
export const cancelOrder = (orderId) => request('DELETE', `/orders/${orderId}`);

// Auth APIs
export const register = (userData) => request('POST', '/register', userData);
export const login = (credentials) => request('POST', '/login', credentials);
export const logout = () => request('GET', '/logout');
export const getCurrentUser = () => request('GET', '/me');
export const updateProfile = (profileData) => request('PUT', '/profile', profileData);

export default api;
