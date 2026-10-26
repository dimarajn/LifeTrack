export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

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
  getExchangeRates: (base = 'PLN') => apiRequest(`/auth/rates?base=${base}`),
  updateCurrency: (currency) => apiRequest('/auth/currency', { method: 'PUT', body: { currency } }),
  updateBudget: (monthlyBudget) => apiRequest('/auth/budget', { method: 'PUT', body: { monthlyBudget } }),
  deleteAccount: () => apiRequest('/auth/account', { method: 'DELETE' }),

  // Transactions
  getTransactions: (params = '') => apiRequest(`/transactions${params ? `?${params}` : ''}`),
  createTransaction: (tx) => apiRequest('/transactions', { method: 'POST', body: tx }),
  updateTransaction: (id, tx) => apiRequest(`/transactions/${id}`, { method: 'PUT', body: tx }),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }),
  getStats: (params = '') => apiRequest(`/transactions/stats${params ? `?${params}` : ''}`),

  // CSV Export
  downloadCsv: async (params = '') => {
    const token = localStorage.getItem('lifetrack_token');
    const res = await fetch(`${API_BASE_URL}/transactions/export/csv${params ? `?${params}` : ''}`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeTrack_Transactions_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Categories
  getCategories: () => apiRequest('/categories'),
  createCategory: (cat) => apiRequest('/categories', { method: 'POST', body: cat }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Savings Goals
  getGoals: () => apiRequest('/goals'),
  createGoal: (goal) => apiRequest('/goals', { method: 'POST', body: goal }),
  depositGoal: (id, amount) => apiRequest(`/goals/${id}/deposit`, { method: 'PATCH', body: { amount } }),
  deleteGoal: (id) => apiRequest(`/goals/${id}`, { method: 'DELETE' }),
};
