import axios from 'axios';

// Base API URL configured through environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Token if available
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

// Response Interceptor: Standardize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for network errors or offline server
    if (!error.response) {
      const networkError = new Error(
        'Unable to connect to the backend server. Please verify the server is running on ' + API_URL
      );
      return Promise.reject(networkError);
    }

    // Handle token expiration / unauthenticated
    if (error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let application state handle redirection smoothly
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const message =
      error.response.data?.message ||
      (error.response.data?.errors && error.response.data.errors[0]?.message) ||
      'An unexpected error occurred. Please try again.';

    const customizedError = new Error(message);
    customizedError.status = error.response.status;
    customizedError.data = error.response.data;
    return Promise.reject(customizedError);
  }
);

// ================= API Modules ================= //

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.patch(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  exportCSV: (params) =>
    api.get('/expenses/export/csv', {
      params,
      responseType: 'blob'
    })
};

export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  getCurrent: () => api.get('/budgets/current'),
  setBudget: (data) => api.post('/budgets', data),
  update: (id, data) => api.patch(`/budgets/${id}`, data)
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getCategories: (params) => api.get('/analytics/categories', { params }),
  getMonthlyTrends: () => api.get('/analytics/monthly')
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data)
};

export default api;
