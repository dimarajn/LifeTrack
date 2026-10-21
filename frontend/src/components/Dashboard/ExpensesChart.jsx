import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './ExpensesChart.module.css';
import { useLanguage } from '../../context/LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const FALLBACK_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#10B981', '#EC4899', '#6366F1'
];

export default function ExpensesChart({ categoryBreakdown, categories }) {
  const { t, translateCategory } = useLanguage();
  const categoryNames = categoryBreakdown ? Object.keys(categoryBreakdown) : [];
  const amounts = categoryBreakdown ? Object.values(categoryBreakdown) : [];

  const hasData = categoryNames.length > 0 && amounts.some(v => v > 0);

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

  const chartData = {
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

  const chartOptions = {
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

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.title}>{t('chart_title')}</h3>
      <div className={styles.chartWrapper}>
        {hasData ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📉</span>
            <p style={{ whiteSpace: 'pre-line' }}>{t('chart_empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
