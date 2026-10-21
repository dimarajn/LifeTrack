import styles from './SummaryCards.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SummaryCards({ stats }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const currency = user?.currency || 'PLN';
  const budget = user?.monthlyBudget || null;

  const balance = stats?.balance ?? 0;
  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpense = stats?.totalExpense ?? 0;

  const pct = budget && budget > 0 ? Math.min(Math.round((totalExpense / budget) * 100), 100) : 0;
  const rawPct = budget && budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;

  let barTone = styles.barSafe;
  if (rawPct >= 100) barTone = styles.barDanger;
  else if (rawPct >= 80) barTone = styles.barWarning;

  return (
    <div className={styles.cardsGrid}>
      {/* Balance Card */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_balance')}</span>
          <span className={`${styles.iconBox} ${styles.iconBalance}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </span>
        </div>
        <div className={`${styles.value} ${balance >= 0 ? styles.positive : styles.negative}`}>
          {balance.toFixed(2)} <span className={styles.currencyLabel}>{currency}</span>
        </div>
      </div>

      {/* Income Card */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_income')}</span>
          <span className={`${styles.iconBox} ${styles.iconIncome}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </div>
        <div className={`${styles.value} ${styles.incomeValue}`}>
          +{totalIncome.toFixed(2)} <span className={styles.currencyLabel}>{currency}</span>
        </div>
      </div>

      {/* Expense Card + Embedded Monthly Budget Bar */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_expense')}</span>
          <span className={`${styles.iconBox} ${styles.iconExpense}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="7" y1="7" x2="17" y2="17" />
              <polyline points="17 7 17 17 7 17" />
            </svg>
          </span>
        </div>
        <div className={`${styles.value} ${styles.expenseValue}`}>
          -{totalExpense.toFixed(2)} <span className={styles.currencyLabel}>{currency}</span>
        </div>

        {budget && budget > 0 && (
          <div className={styles.budgetFooter}>
            <div className={styles.budgetMeta}>
              <span>Limit: {budget.toFixed(0)} {currency}</span>
              <span className={rawPct >= 100 ? styles.pctDanger : rawPct >= 80 ? styles.pctWarning : styles.pctSafe}>
                {rawPct}%
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div className={`${styles.progressFill} ${barTone}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
