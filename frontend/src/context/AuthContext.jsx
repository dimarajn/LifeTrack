import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lifetrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(userData => {
          setUser(userData);
        })
        .catch(err => {
          console.error('Failed to restore session:', err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('lifetrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name, currency, gdprConsent) => {
    const data = await api.register({ email, password, name, currency, gdprConsent });
    localStorage.setItem('lifetrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lifetrack_token');
    setToken(null);
    setUser(null);
  };

  const updateCurrency = async (newCurrency, optimisticRate = null) => {
    if (optimisticRate && user) {
      setUser(prev => prev ? ({
        ...prev,
        currency: newCurrency,
        monthlyBudget: prev.monthlyBudget
          ? Math.round(prev.monthlyBudget * optimisticRate * 100) / 100
          : null
      }) : prev);
    }
    const data = await api.updateCurrency(newCurrency);
    setUser(data.user);
    return data;
  };

  const updateBudget = async (monthlyBudget) => {
    const data = await api.updateBudget(monthlyBudget);
    setUser(data.user);
    return data.user;
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateCurrency, updateBudget, deleteAccount, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
