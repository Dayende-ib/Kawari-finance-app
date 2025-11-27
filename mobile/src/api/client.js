import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 10000,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const ping = () => api.get('/');
export const login = (payload) => api.post('/api/auth/login', payload);
export const register = (payload) => api.post('/api/auth/register', payload);
export const fetchDashboard = () => api.get('/api/finance/dashboard');
export const createSale = (payload) => api.post('/api/finance/sales', payload);
export const createExpense = (payload) => api.post('/api/finance/expenses', payload);
export const createInvoice = (payload) => api.post('/api/finance/invoices', payload);
export const fetchInvoices = () => api.get('/api/finance/invoices');

export default api;
