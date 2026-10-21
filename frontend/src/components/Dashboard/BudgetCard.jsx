import { useState } from 'react';
import styles from './BudgetCard.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BudgetCard({ totalExpense = 0 }) {
  const { user, updateBudget } = useAuth();
  const { t } = useLanguage();
  const currency = user?.currency || 'PLN';
  const budget = user?.monthlyBudget || null;

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budget ? String(budget) : '');
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    setInputVal(budget ? String(budget) : '');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const val = inputVal.trim() === '' ? null : Number(inputVal);
      await updateBudget(val);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update budget:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await updateBudget(null);
      setInputVal('');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const percentage = budget && budget > 0 ? Math.min(Math.round((totalExpense / budget) * 100), 100) : 0;
  const rawPercentage = budget && budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;
  const remaining = budget ? budget - totalExpense : 0;

  let barColorClass = styles.barSafe;
  if (rawPercentage >= 100) {
    barColorClass = styles.barDanger;
  } else if (rawPercentage >= 80) {
    barColorClass = styles.barWarning;
  }

  return (
    <div className={styles.budgetCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{t('budget_title')}</h3>
          {budget && rawPercentage >= 80 && rawPercentage < 100 && (
            <span className={styles.warningBadge}>{t('budget_warning')}</span>
          )}
          {budget && rawPercentage >= 100 && (
            <span className={styles.dangerBadge}>
              {t('budget_exceeded')} {Math.abs(remaining).toFixed(2)} {currency}
            </span>
          )}
        </div>

        {!isEditing && (
          <button type="button" className={styles.editBtn} onClick={handleOpenEdit}>
            ⚙️ {budget ? t('budget_edit_btn') : t('budget_set_btn')}
          </button>
        )}
      </div>

      {isEditing ? (
        <form className={styles.editForm} onSubmit={handleSave}>
          <input
            type="number"
            step="0.01"
            min="1"
            className={styles.input}
            placeholder={`${t('budget_placeholder')} (${currency})`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {t('btn_save')}
          </button>
          {budget && (
            <button type="button" className={styles.clearBtn} onClick={handleClear} disabled={saving}>
              {t('budget_clear')}
            </button>
          )}
          <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
            {t('btn_cancel')}
          </button>
        </form>
      ) : budget ? (
        <div className={styles.progressSection}>
          <div className={styles.statsRow}>
            <span>
              {t('budget_spent')}: <strong>{totalExpense.toFixed(2)} {currency}</strong> / {budget.toFixed(2)} {currency} ({rawPercentage}%)
            </span>
            <span>
              {remaining >= 0
                ? <>{t('budget_remaining')}: <strong className={styles.remainingOk}>{remaining.toFixed(2)} {currency}</strong></>
                : <strong className={styles.remainingOver}>-{Math.abs(remaining).toFixed(2)} {currency}</strong>
              }
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${barColorClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      ) : (
        <p className={styles.emptyText}>{t('budget_not_set')}</p>
      )}
    </div>
  );
}
