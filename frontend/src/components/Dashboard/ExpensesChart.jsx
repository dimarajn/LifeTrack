import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import styles from './ExpensesChart.module.css';
import { useLanguage } from '../../context/LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const FALLBACK_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#10B981', '#EC4899', '#6366F1'
];

export default function ExpensesChart({ categoryBreakdown, categories, stats }) {
  const { t, translateCategory } = useLanguage();
  const [chartType, setChartType] = useState('doughnut'); // 'doughnut' | 'bar'

  const categoryNames = categoryBreakdown ? Object.keys(categoryBreakdown) : [];
  const amounts = categoryBreakdown ? Object.values(categoryBreakdown) : [];

  const hasDoughnutData = categoryNames.length > 0 && amounts.some(v => v > 0);
  const totalIncome = stats?.totalIncome || 0;
  const totalExpense = stats?.totalExpense || 0;
  const hasBarData = totalIncome > 0 || totalExpense > 0;

  // Map each category to its defined color (or fallback palette)
  const colorMap = {};
  if (categories?.expense) {
    categories.expense.forEach(c => {
      if (c.name && c.color) {
        colorMap[c.name.toLowerCase()] = c.color;
      }
    });
  }

  const backgroundColors = categoryNames.map((cat, idx) => {
    return colorMap[cat.toLowerCase()] || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
  });

  const doughnutData = {
    labels: categoryNames.map(c => translateCategory(c)),
    datasets: [
      {
        data: amounts,
        backgroundColor: backgroundColors,
        borderColor: '#17181f',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d1d5db',
          font: { size: 12 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  const barData = {
    labels: [t('bar_income'), t('bar_expense')],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(239, 68, 68, 0.85)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1.5,
        borderRadius: 8,
        barThickness: 56,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#d1d5db', font: { size: 13, weight: '600' } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
      },
    },
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{t('chart_title')}</h3>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${chartType === 'doughnut' ? styles.tabBtnActive : ''}`}
            onClick={() => setChartType('doughnut')}
          >
            {t('chart_tab_doughnut')}
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${chartType === 'bar' ? styles.tabBtnActive : ''}`}
            onClick={() => setChartType('bar')}
          >
            {t('chart_tab_bar')}
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {chartType === 'doughnut' ? (
          hasDoughnutData ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className={styles.emptyState}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.6">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10h-10z" />
              </svg>
              <p style={{ whiteSpace: 'pre-line' }}>{t('chart_empty')}</p>
            </div>
          )
        ) : hasBarData ? (
          <div className={styles.barContainer}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div className={styles.emptyState}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.6">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p style={{ whiteSpace: 'pre-line' }}>{t('chart_empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
