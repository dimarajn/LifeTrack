import { useState } from 'react';
import styles from './TransactionList.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionList({
  transactions,
  categories,
  onDeleteTransaction,
  onEditTransaction
}) {
  const { user } = useAuth();
  const { language, t, translateCategory } = useLanguage();
  const currency = user?.currency || 'PLN';

  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Build category color lookup
  const colorMap = {};
  [...(categories?.expense || []), ...(categories?.income || [])].forEach(c => {
    if (c.name && c.color) colorMap[c.name.toLowerCase()] = c.color;
  });

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
      const locale = language === 'pl' ? 'pl-PL' : language === 'es' ? 'es-ES' : 'en-US';
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

  const toggleSearch = () => {
    if (showSearch) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
    setShowSearch(!showSearch);
  };

  return (
    <div className={styles.listCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('list_title')}</h3>

        <div className={styles.headerControls}>
          <button
            type="button"
            className={`${styles.iconToggleBtn} ${showSearch ? styles.iconToggleActive : ''}`}
            onClick={toggleSearch}
            title={t('search_placeholder')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

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
      </div>

      {/* Collapsible Search & Category Filter Row */}
      {showSearch && (
        <div className={styles.searchBarRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
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
      )}

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {t('list_empty')}
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((item) => {
            const dotColor = colorMap[(item.category || '').toLowerCase()] || (item.type === 'income' ? '#10b981' : '#3b82f6');
            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemLeft}>
                  <span className={styles.catDot} style={{ backgroundColor: dotColor }} />
                  <div className={styles.itemText}>
                    <div className={styles.topLine}>
                      <span className={styles.categoryTag}>{translateCategory(item.category)}</span>
                      <span className={styles.date}>{formatDate(item.date || item.createdAt)}</span>
                    </div>
                    {item.comment && <span className={styles.comment}>{item.comment}</span>}
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <span className={`${styles.amount} ${item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount}`}>
                    {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toFixed(2)} {currency}
                  </span>

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => onEditTransaction(item)}
                      title={t('edit_tx_tooltip')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => handleDelete(item.id)}
                      title={t('delete_tx_tooltip')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
