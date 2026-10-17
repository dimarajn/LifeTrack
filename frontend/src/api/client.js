const API_BASE_URL = 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('lifetrack_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Status
  getStatus: () => apiRequest('/status'),

  // Auth
  register: (credentials) => apiRequest('/auth/register', { method: 'POST', body: credentials }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => apiRequest('/auth/me'),

  // Transactions
  getTransactions: (params = '') => apiRequest(`/transactions${params ? `?${params}` : ''}`),
  createTransaction: (tx) => apiRequest('/transactions', { method: 'POST', body: tx }),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/transactions/stats'),

  // Categories
  getCategories: () => apiRequest('/categories'),
};
