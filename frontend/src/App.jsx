import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './api/client';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import PeriodFilter from './components/Dashboard/PeriodFilter';
import SummaryCards from './components/Dashboard/SummaryCards';
import TransactionForm from './components/Dashboard/TransactionForm';
import ExpensesChart from './components/Dashboard/ExpensesChart';
import TransactionList from './components/Dashboard/TransactionList';
import CategoryModal from './components/Categories/CategoryModal';

// Helper to compute ISO date ranges for filters
function calculateDateRange(period) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];

  if (period === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = firstDay.toISOString().split('T')[0];
    return { from, to };
  }

  if (period === 'last_30') {
    const past = new Date();
    past.setDate(past.getDate() - 30);
    const from = past.toISOString().split('T')[0];
    return { from, to };
  }

  if (period === 'this_year') {
    const firstDayYear = new Date(now.getFullYear(), 0, 1);
    const from = firstDayYear.toISOString().split('T')[0];
    return { from, to };
  }

  return { from: null, to: null };
}

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [serverMessage, setServerMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Check backend server status
  useEffect(() => {
    api.getStatus()
      .then(res => setServerMessage(res.message))
      .catch(() => setServerMessage(t('server_offline')));
  }, [t]);

  // Fetch transactions and stats based on selected date period
  const loadDashboardData = useCallback(async (period = selectedPeriod) => {
    if (!isAuthenticated) return;
    try {
      const { from, to } = calculateDateRange(period);
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);
      const queryString = queryParams.toString();

      const [txList, statsData, catsData] = await Promise.all([
        api.getTransactions(queryString),
        api.getStats(queryString),
        api.getCategories()
      ]);
      setTransactions(txList);
      setStats(statsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [isAuthenticated, selectedPeriod]);

  useEffect(() => {
    loadDashboardData(selectedPeriod);
  }, [loadDashboardData, selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    loadDashboardData(period);
  };

  const handleAddTransaction = async (newTx) => {
    await api.createTransaction(newTx);
    await loadDashboardData(selectedPeriod);
  };

  const handleDeleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    await loadDashboardData(selectedPeriod);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const { from, to } = calculateDateRange(selectedPeriod);
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);
      await api.downloadCsv(queryParams.toString());
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Nie udało się wyeksportować pliku CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddCategory = async (newCat) => {
    await api.createCategory(newCat);
    const updatedCategories = await api.getCategories();
    setCategories(updatedCategories);
  };

  const handleDeleteCategory = async (id) => {
    await api.deleteCategory(id);
    const updatedCategories = await api.getCategories();
    setCategories(updatedCategories);
  };

  if (authLoading) {
    return <div className={styles.loadingSpinner}>{t('loading_app')}</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar serverMessage={serverMessage} />

      {!isAuthenticated ? (
        <AuthModal />
      ) : (
        <>
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handlePeriodChange}
            onExport={handleExportCsv}
            isExporting={isExporting}
          />

          <SummaryCards stats={stats} />
          
          <TransactionForm 
            categories={categories} 
            onAddTransaction={handleAddTransaction} 
            onOpenCategories={() => setIsCategoryModalOpen(true)}
          />

          <div className={styles.dashboardGrid}>
            <ExpensesChart 
              categoryBreakdown={stats?.categoryBreakdown} 
              categories={categories}
            />
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction} 
            />
          </div>

          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}