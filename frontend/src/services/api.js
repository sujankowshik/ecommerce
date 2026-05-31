import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT token
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

// Response Interceptor: Centralize error message extractions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    
    // Auto-logout if token is expired / invalid
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      console.warn('Authentication token expired or invalid. Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force page reload to clear memory state and redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
