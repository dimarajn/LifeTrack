import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './api/client';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import PeriodFilter from './components/Dashboard/PeriodFilter';
import SummaryCards from './components/Dashboard/SummaryCards';
import GoalsSection from './components/Dashboard/GoalsSection';
import TransactionForm from './components/Dashboard/TransactionForm';
import ExpensesChart from './components/Dashboard/ExpensesChart';
import TransactionList from './components/Dashboard/TransactionList';
import CategoryModal from './components/Categories/CategoryModal';
import EditTransactionModal from './components/Dashboard/EditTransactionModal';

function calculateDateRange(period, customDates) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (period === 'day') {
    const day = customDates?.from || todayStr;
    return { from: day, to: day };
  }

  if (period === 'this_week') {
    const dayOfWeek = now.getDay() || 7;
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

  return { from: null, to: null };
}

function MainApp() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [serverMessage, setServerMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [goals, setGoals] = useState([]);

  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [activeRange, setActiveRange] = useState(() => calculateDateRange('this_month'));

  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    api.getStatus()
      .then(res => setServerMessage(res.message))
      .catch(() => setServerMessage(t('server_offline')));
  }, [t]);

  const loadDashboardData = useCallback(async (range = activeRange) => {
    if (!isAuthenticated) return;
    try {
      const queryParams = new URLSearchParams();
      if (range.from) queryParams.append('from', range.from);
      if (range.to) queryParams.append('to', range.to);
      const queryString = queryParams.toString();

      const [txList, statsData, catsData, goalsData] = await Promise.all([
        api.getTransactions(queryString),
        api.getStats(queryString),
        api.getCategories(),
        api.getGoals()
      ]);
      setTransactions(txList);
      setStats(statsData);
      setCategories(catsData);
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [isAuthenticated, activeRange]);

  useEffect(() => {
    loadDashboardData(activeRange);
  }, [loadDashboardData, activeRange]);

  const handleInstantCurrencyConvert = (newCurrency, rate) => {
    if (!rate || rate === 1) return;
    const round2 = (v) => Math.round(Number(v) * rate * 100) / 100;

    setTransactions(prev =>
      prev.map(tx => ({ ...tx, amount: Math.max(0.01, round2(tx.amount)) }))
    );

    setGoals(prev =>
      prev.map(g => ({
        ...g,
        targetAmount: Math.max(0.01, round2(g.targetAmount)),
        currentAmount: round2(g.currentAmount)
      }))
    );

    setStats(prev => {
      if (!prev) return prev;
      const newBreakdown = {};
      if (prev.categoryBreakdown) {
        for (const [k, v] of Object.entries(prev.categoryBreakdown)) {
          newBreakdown[k] = round2(v);
        }
      }
      const totalIncome = round2(prev.totalIncome || 0);
      const totalExpense = round2(prev.totalExpense || 0);
      return {
        ...prev,
        totalIncome,
        totalExpense,
        balance: Math.round((totalIncome - totalExpense) * 100) / 100,
        categoryBreakdown: newBreakdown
      };
    });
  };

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

  const handleAddGoal = async (newGoal) => {
    await api.createGoal(newGoal);
    const updatedGoals = await api.getGoals();
    setGoals(updatedGoals);
  };

  const handleDepositGoal = async (id, amount) => {
    await api.depositGoal(id, amount);
    const updatedGoals = await api.getGoals();
    setGoals(updatedGoals);
  };

  const handleDeleteGoal = async (id) => {
    await api.deleteGoal(id);
    const updatedGoals = await api.getGoals();
    setGoals(updatedGoals);
  };

  if (authLoading) {
    return <div className={styles.loadingSpinner}>{t('loading_app')}</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar
        serverMessage={serverMessage}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
        onInstantConvert={handleInstantCurrencyConvert}
      />

      {!isAuthenticated ? (
        <AuthModal />
      ) : (
        <>
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handlePeriodChange}
            onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
          />

          <SummaryCards stats={stats} />

          <GoalsSection
            goals={goals}
            onAddGoal={handleAddGoal}
            onDepositGoal={handleDepositGoal}
            onDeleteGoal={handleDeleteGoal}
          />

          <div className={styles.dashboardGrid}>
            <ExpensesChart
              categoryBreakdown={stats?.categoryBreakdown}
              categories={categories}
              stats={stats}
            />
            <TransactionList
              transactions={transactions}
              categories={categories}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
            />
          </div>

          <TransactionForm
            isOpen={isNewTxModalOpen}
            onClose={() => setIsNewTxModalOpen(false)}
            categories={categories}
            onAddTransaction={handleAddTransaction}
            onOpenCategories={() => setIsCategoryModalOpen(true)}
          />

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
