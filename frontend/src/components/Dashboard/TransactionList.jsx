import { useState } from 'react';
import styles from './TransactionList.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionList({ transactions, onDeleteTransaction }) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const currency = user?.currency || 'PLN';
  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const locale = language === 'pl' ? 'pl-PL' : 'en-US';
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('delete_tx_confirm'))) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className={styles.listCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('list_title')}</h3>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('filter_all')}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'expense' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('expense')}
          >
            {t('filter_expenses')}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'income' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('income')}
          >
            {t('filter_incomes')}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {t('list_empty')}
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <span className={styles.categoryTag}>{item.category}</span>
                {item.comment && <span className={styles.comment}>{item.comment}</span>}
                <span className={styles.date}>{formatDate(item.date || item.createdAt)}</span>
              </div>

              <div className={styles.itemRight}>
                <span className={`${styles.amount} ${item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount}`}>
                  {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toFixed(2)} {currency}
                </span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(item.id)}
                  title={t('delete_tx_tooltip')}
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
