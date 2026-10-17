import { useState } from 'react';
import styles from './TransactionList.module.css';
import { useAuth } from '../../context/AuthContext';

export default function TransactionList({ transactions, onDeleteTransaction }) {
  const { user } = useAuth();
  const currency = user?.currency || 'PLN';
  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.listCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Последние операции</h3>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'expense' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('expense')}
          >
            Расходы
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'income' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('income')}
          >
            Доходы
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          Операций пока нет
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((t) => (
            <li key={t.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <span className={styles.categoryTag}>{t.category}</span>
                {t.comment && <span className={styles.comment}>{t.comment}</span>}
                <span className={styles.date}>{formatDate(t.date || t.createdAt)}</span>
              </div>

              <div className={styles.itemRight}>
                <span className={`${styles.amount} ${t.type === 'expense' ? styles.expenseAmount : styles.incomeAmount}`}>
                  {t.type === 'expense' ? '-' : '+'}{Number(t.amount).toFixed(2)} {currency}
                </span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDeleteTransaction(t.id)}
                  title="Удалить запись"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
