import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
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

export const login = (payload) => api.post('/api/auth/login', payload);
export const register = (payload) => api.post('/api/auth/register', payload);
export const me = () => api.get('/api/auth/me');
export const updateProfile = (payload) => api.put('/api/auth/profile', payload);
export const fetchDashboard = () => api.get('/api/finance/dashboard');
export const createSale = (payload) => api.post('/api/finance/sales', payload);
export const createExpense = (payload) => api.post('/api/finance/expenses', payload);
export const updateSale = (id, payload) => api.put(`/api/finance/sales/${id}`, payload);
export const deleteSale = (id) => api.delete(`/api/finance/sales/${id}`);
export const updateExpense = (id, payload) => api.put(`/api/finance/expenses/${id}`, payload);
export const deleteExpense = (id) => api.delete(`/api/finance/expenses/${id}`);
export const createInvoice = (payload) => api.post('/api/finance/invoices', payload);
export const fetchInvoices = () => api.get('/api/finance/invoices');
export const fetchSales = () => api.get('/api/finance/sales');
export const fetchExpenses = () => api.get('/api/finance/expenses');
export const updateInvoice = (id, payload) => api.put(`/api/finance/invoices/${id}`, payload);
export const deleteInvoice = (id) => api.delete(`/api/finance/invoices/${id}`);

export default api;
