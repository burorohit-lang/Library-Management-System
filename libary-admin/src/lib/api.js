import axios from 'axios';

// Normalize baseURL: supports VITE_API_URL (e.g., https://your-api.onrender.com or https://your-api.onrender.com/api)
// and safely falls back to '/api' when frontend and backend share the same domain (like Vercel).
const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const baseURL = rawBaseUrl
  ? rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : `${rawBaseUrl}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // <-- Added: Ensures cookies/sessions are sent properly across origins if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Clear stale credentials on 401 (skip login/register endpoints so wrong-password alerts still show)
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;