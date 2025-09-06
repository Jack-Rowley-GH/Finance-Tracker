import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, name, email: userEmail } = response.data;
  localStorage.setItem('token', token);
  return { name, email: userEmail };
};

export const register = async (name, email, password, confirmPassword) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    confirmPassword,
  });
  const { token, name: userName, email: userEmail } = response.data;
  localStorage.setItem('token', token);
  return { name: userName, email: userEmail };
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/validate');
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    };
  }
  throw new Error('No valid token');
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const getTransactionSummary = async () => {
  const response = await api.get('/transactions/summary');
  return response.data;
};

export const createTransaction = async (transaction) => {
  const response = await api.post('/transactions', transaction);
  return response.data;
};

export const updateTransaction = async (id, transaction) => {
  const response = await api.put(`/transactions/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};

export const getCategories = async () => {
  const response = await api.get('/transactions/categories');
  return response.data;
};

export default api;