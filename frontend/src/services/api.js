import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartvote_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or auth verification failure
      const isAuthPath = error.config.url.includes('/auth/login') ||
                         error.config.url.includes('/auth/verify-');
      if (!isAuthPath) {
        localStorage.removeItem('smartvote_token');
        localStorage.removeItem('smartvote_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
