/**
 * api.js - Axios API Instance
 * 
 * Centralized HTTP client configuration:
 * - Base URL points to backend
 * - Auto-attaches JWT token from localStorage
 * - Handles 401 errors by redirecting to login
 */

import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: '/api', // Proxied to http://localhost:5000 via Vite config
  timeout: 15000,  // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───
// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───
// Handle global errors (401 → logout, network errors)
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      delete axios.defaults.headers.common['Authorization'];
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
