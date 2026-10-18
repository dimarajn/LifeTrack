import { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionForm({ categories, onAddTransaction, onOpenCategories }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const currency = user?.currency || 'PLN';

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onAddTransaction({
        type,
        amount: Number(amount),
        category: category || availableCategories[0] || 'Other',
        comment
      });
      setAmount('');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.heading}>{t('form_heading')}</h3>
        <button
          type="button"
          className={styles.manageCatBtn}
          onClick={onOpenCategories}
        >
          {t('btn_manage_categories')}
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <select
          className={`${styles.select} ${styles.typeSelect}`}
          value={type}
          onChange={(e) => {
            const newType = e.target.value;
            setType(newType);
            const nextList = newType === 'expense' ? categories?.expense : categories?.income;
            if (nextList && nextList.length > 0) {
              const first = typeof nextList[0] === 'object' ? nextList[0].name : nextList[0];
              setCategory(first);
            }
          }}
        >
          <option value="expense">{t('type_expense')}</option>
          <option value="income">{t('type_income')}</option>
        </select>

        <input
          className={`${styles.input} ${styles.amountInput}`}
          type="number"
          step="0.01"
          placeholder={`${t('amount_placeholder')} (${currency})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className={`${styles.select} ${styles.categorySelect}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          className={`${styles.input} ${styles.commentInput}`}
          type="text"
          placeholder={t('comment_placeholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className={styles.submitBtn} type="submit" disabled={submitting}>
          {submitting ? '...' : t('btn_add_transaction')}
        </button>
      </form>
    </div>
  );
}
