import { useState } from 'react';
import styles from './TransactionList.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionList({ transactions, onDeleteTransaction, onEditTransaction }) {
  const { user } = useAuth();
  const { language, t, translateCategory } = useLanguage();
  const currency = user?.currency || 'PLN';

  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Unique categories present in current transactions
  const uniqueCategories = Array.from(new Set(transactions.map(tx => tx.category).filter(Boolean)));

  const filtered = transactions.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const commentMatch = (item.comment || '').toLowerCase().includes(q);
      const rawCatMatch = (item.category || '').toLowerCase().includes(q);
      const translatedCatMatch = translateCategory(item.category).toLowerCase().includes(q);
      if (!commentMatch && !rawCatMatch && !translatedCatMatch) return false;
    }

    return true;
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

      {/* Search & Category Filter Row */}
      <div className={styles.searchBarRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className={styles.categoryFilterSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">{t('all_categories')}</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>
              {translateCategory(cat)}
            </option>
          ))}
        </select>
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
                <span className={styles.categoryTag}>{translateCategory(item.category)}</span>
                {item.comment && <span className={styles.comment}>{item.comment}</span>}
                <span className={styles.date}>{formatDate(item.date || item.createdAt)}</span>
              </div>

              <div className={styles.itemRight}>
                <span className={`${styles.amount} ${item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount}`}>
                  {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toFixed(2)} {currency}
                </span>
                <button
                  className={styles.editBtn}
                  onClick={() => onEditTransaction(item)}
                  title={t('edit_tx_tooltip')}
                >
                  ✏️
                </button>
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
