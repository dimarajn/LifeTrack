import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './api/client';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import PeriodFilter from './components/Dashboard/PeriodFilter';
import SummaryCards from './components/Dashboard/SummaryCards';
import BudgetCard from './components/Dashboard/BudgetCard';
import TransactionForm from './components/Dashboard/TransactionForm';
import ExpensesChart from './components/Dashboard/ExpensesChart';
import TransactionList from './components/Dashboard/TransactionList';
import CategoryModal from './components/Categories/CategoryModal';
import EditTransactionModal from './components/Dashboard/EditTransactionModal';

// Helper to compute date ranges for filters
function calculateDateRange(period, customDates) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (period === 'day') {
    const day = customDates?.from || todayStr;
    return { from: day, to: day };
  }

  if (period === 'this_week') {
    const dayOfWeek = now.getDay() || 7; // 1 = Monday, 7 = Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      from: monday.toISOString().split('T')[0],
      to: sunday.toISOString().split('T')[0]
    };
  }

  if (period === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  }

  if (period === 'custom_range') {
    return {
      from: customDates?.from || todayStr,
      to: customDates?.to || todayStr
    };
  }

  return { from: null, to: null }; // 'all'
}

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [serverMessage, setServerMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  
  // Default to 'this_month' (Current month)
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [activeRange, setActiveRange] = useState(() => calculateDateRange('this_month'));
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Check backend server status
  useEffect(() => {
    api.getStatus()
      .then(res => setServerMessage(res.message))
      .catch(() => setServerMessage(t('server_offline')));
  }, [t]);

  // Fetch transactions and stats for the active date range
  const loadDashboardData = useCallback(async (range = activeRange) => {
    if (!isAuthenticated) return;
    try {
      const queryParams = new URLSearchParams();
      if (range.from) queryParams.append('from', range.from);
      if (range.to) queryParams.append('to', range.to);
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
  }, [isAuthenticated, activeRange]);

  useEffect(() => {
    loadDashboardData(activeRange);
  }, [loadDashboardData, activeRange]);

  const handlePeriodChange = (period, customDates) => {
    const range = calculateDateRange(period, customDates);
    setSelectedPeriod(period);
    setActiveRange(range);
    loadDashboardData(range);
  };

  const handleAddTransaction = async (newTx) => {
    await api.createTransaction(newTx);
    await loadDashboardData(activeRange);
  };

  const handleDeleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    await loadDashboardData(activeRange);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
  };

  const handleSaveEdit = async () => {
    await loadDashboardData(activeRange);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (activeRange.from) queryParams.append('from', activeRange.from);
      if (activeRange.to) queryParams.append('to', activeRange.to);
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

          <BudgetCard totalExpense={stats?.totalExpense || 0} />
          
          <TransactionForm 
            categories={categories} 
            onAddTransaction={handleAddTransaction} 
            onOpenCategories={() => setIsCategoryModalOpen(true)}
          />

          <div className={styles.dashboardGrid}>
            <ExpensesChart 
              categoryBreakdown={stats?.categoryBreakdown} 
              categories={categories}
              stats={stats}
            />
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
            />
          </div>

          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          <EditTransactionModal
            transaction={editingTransaction}
            isOpen={!!editingTransaction}
            onClose={() => setEditingTransaction(null)}
            categories={categories}
            onSave={handleSaveEdit}
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