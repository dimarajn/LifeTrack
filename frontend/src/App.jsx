import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import SummaryCards from './components/Dashboard/SummaryCards';
import TransactionForm from './components/Dashboard/TransactionForm';
import ExpensesChart from './components/Dashboard/ExpensesChart';
import TransactionList from './components/Dashboard/TransactionList';

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [serverMessage, setServerMessage] = useState('Checking connection...');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loadingData, setLoadingData] = useState(false);

  // Check backend server status
  useEffect(() => {
    api.getStatus()
      .then(res => setServerMessage(res.message))
      .catch(() => setServerMessage('Backend Offline 🔴'));
  }, []);

  // Fetch user transactions, stats, and categories
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const [txList, statsData, catsData] = await Promise.all([
        api.getTransactions(),
        api.getStats(),
        api.getCategories()
      ]);
      setTransactions(txList);
      setStats(statsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAddTransaction = async (newTx) => {
    await api.createTransaction(newTx);
    await loadDashboardData();
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Точно удалить эту операцию?')) return;
    await api.deleteTransaction(id);
    await loadDashboardData();
  };

  if (authLoading) {
    return <div className={styles.loadingSpinner}>Загрузка LifeTrack...</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar serverMessage={serverMessage} />

      {!isAuthenticated ? (
        <AuthModal />
      ) : (
        <>
          <SummaryCards stats={stats} />
          
          <TransactionForm 
            categories={categories} 
            onAddTransaction={handleAddTransaction} 
          />

          <div className={styles.dashboardGrid}>
            <ExpensesChart categoryBreakdown={stats?.categoryBreakdown} />
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction} 
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}