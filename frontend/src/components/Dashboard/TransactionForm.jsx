import { useState } from 'react';
import styles from './TransactionForm.module.css';
import { useAuth } from '../../context/AuthContext';

export default function TransactionForm({ categories, onAddTransaction }) {
  const { user } = useAuth();
  const currency = user?.currency || 'PLN';

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableCategories = type === 'expense'
    ? categories?.expense || ['Food', 'Transport', 'Rent', 'Entertainment', 'Health', 'Other']
    : categories?.income || ['Salary', 'Freelance', 'Gift', 'Investments', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onAddTransaction({
        type,
        amount: Number(amount),
        category: category || availableCategories[0],
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
      <h3 className={styles.heading}>➕ Добавить операцию</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <select
          className={`${styles.select} ${styles.typeSelect}`}
          value={type}
          onChange={(e) => {
            const newType = e.target.value;
            setType(newType);
            const nextCats = newType === 'expense' ? categories?.expense : categories?.income;
            if (nextCats && nextCats.length > 0) setCategory(nextCats[0]);
          }}
        >
          <option value="expense">Расход (-)</option>
          <option value="income">Доход (+)</option>
        </select>

        <input
          className={`${styles.input} ${styles.amountInput}`}
          type="number"
          step="0.01"
          placeholder={`Сумма (${currency})`}
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
          placeholder="Комментарий (напр. Обед в кафе, зарплата...)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className={styles.submitBtn} type="submit" disabled={submitting}>
          {submitting ? '...' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}
