import styles from './SummaryCards.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SummaryCards({ stats }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const currency = user?.currency || 'PLN';

  const balance = stats?.balance ?? 0;
  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpense = stats?.totalExpense ?? 0;

  return (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_balance')}</span>
          <span className={styles.icon}>💰</span>
        </div>
        <div className={`${styles.value} ${balance >= 0 ? styles.positive : styles.negative}`}>
          {balance.toFixed(2)} {currency}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_income')}</span>
          <span className={styles.icon}>📈</span>
        </div>
        <div className={`${styles.value} ${styles.incomeValue}`}>
          +{totalIncome.toFixed(2)} {currency}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{t('card_expense')}</span>
          <span className={styles.icon}>📉</span>
        </div>
        <div className={`${styles.value} ${styles.expenseValue}`}>
          -{totalExpense.toFixed(2)} {currency}
        </div>
      </div>
    </div>
  );
}
