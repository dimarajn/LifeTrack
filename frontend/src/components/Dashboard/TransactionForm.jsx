import { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionForm({
  isOpen,
  onClose,
  categories,
  onAddTransaction,
  onOpenCategories
}) {
  const { user } = useAuth();
  const { t, translateCategory } = useLanguage();
  const currency = user?.currency || 'PLN';

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const rawList = type === 'expense'
    ? categories?.expense || []
    : categories?.income || [];

  const availableCategories = rawList.map(c => typeof c === 'object' ? c.name : c);

  useEffect(() => {
    if (availableCategories.length > 0 && (!category || !availableCategories.includes(category))) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onAddTransaction({
        type,
        amount: Number(amount),
        category: category || availableCategories[0] || 'Other',
        comment,
        date
      });
      setAmount('');
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.headerRow}>
          <h3 className={styles.heading}>{t('form_heading')}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Segmented Type Toggle */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'expense' ? styles.typeExpenseActive : ''}`}
              onClick={() => {
                setType('expense');
                const next = categories?.expense;
                if (next?.length) setCategory(typeof next[0] === 'object' ? next[0].name : next[0]);
              }}
            >
              {t('type_expense')}
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'income' ? styles.typeIncomeActive : ''}`}
              onClick={() => {
                setType('income');
                const next = categories?.income;
                if (next?.length) setCategory(typeof next[0] === 'object' ? next[0].name : next[0]);
              }}
            >
              {t('type_income')}
            </button>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t('amount_placeholder')} ({currency})</label>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t('select_day')}</label>
              <input
                className={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>{t('btn_manage_categories')}</label>
              <button
                type="button"
                className={styles.manageCatLink}
                onClick={() => {
                  onClose();
                  onOpenCategories();
                }}
              >
                + {t('btn_manage_categories')}
              </button>
            </div>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('comment_placeholder').split('(')[0].trim()}</label>
            <input
              className={styles.input}
              type="text"
              placeholder={t('comment_placeholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {t('btn_cancel')}
            </button>
            <button className={styles.submitBtn} type="submit" disabled={submitting}>
              {submitting ? '...' : t('btn_add_transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
