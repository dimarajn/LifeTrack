import { useState, useEffect } from 'react';
import styles from './EditTransactionModal.module.css';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';

export default function EditTransactionModal({ transaction, isOpen, onClose, categories, onSave }) {
  const { t, translateCategory } = useLanguage();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: string }

  // Pre-fill fields when modal opens with a transaction
  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setAmount(String(transaction.amount || ''));
      setCategory(transaction.category || '');
      setComment(transaction.comment || '');
      // Format date to YYYY-MM-DD for <input type="date">
      const raw = transaction.date || transaction.createdAt;
      setDate(raw ? raw.split('T')[0] : '');
      setFeedback(null);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const currentCats = type === 'expense' ? categories.expense : categories.income;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    setFeedback(null);
    try {
      await api.updateTransaction(transaction.id, {
        type,
        amount: Number(amount),
        category,
        comment,
        date,
      });
      setFeedback({ type: 'success', message: t('edit_success') });
      setTimeout(() => {
        onSave();
        onClose();
      }, 700);
    } catch (err) {
      console.error('Edit transaction error:', err);
      setFeedback({ type: 'error', message: t('edit_error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('edit_modal_title')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${styles.typeBtnExpense} ${type === 'expense' ? styles.active : ''}`}
              onClick={() => { setType('expense'); setCategory(''); }}
            >
              {t('type_expense')}
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${styles.typeBtnIncome} ${type === 'income' ? styles.active : ''}`}
              onClick={() => { setType('income'); setCategory(''); }}
            >
              {t('type_income')}
            </button>
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('amount_placeholder')}</label>
            <input
              className={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('cat_modal_title').replace('🏷️ ', '').replace('Zarządzanie ', '').replace('Manage ', '')}</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>—</option>
              {currentCats.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {translateCategory(cat.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('comment_placeholder').split('(')[0].trim()}</label>
            <input
              className={styles.input}
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('comment_placeholder')}
            />
          </div>

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('select_day')}</label>
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}>
              {feedback.message}
            </div>
          )}

          {/* Buttons */}
          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              {t('btn_cancel')}
            </button>
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? t('loading') : t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
