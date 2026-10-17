import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import styles from './ExpensesChart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#10B981', '#EC4899', '#6366F1'
];

export default function ExpensesChart({ categoryBreakdown }) {
  const categories = categoryBreakdown ? Object.keys(categoryBreakdown) : [];
  const amounts = categoryBreakdown ? Object.values(categoryBreakdown) : [];

  const hasData = categories.length > 0 && amounts.some(v => v > 0);

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: PALETTE.slice(0, categories.length),
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
      <h3 className={styles.title}>Расходы по категориям</h3>
      <div className={styles.chartWrapper}>
        {hasData ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📉</span>
            <p>Нет расходов для отображения графика.<br />Добавьте первую операцию выше!</p>
          </div>
        )}
      </div>
    </div>
  );
}
