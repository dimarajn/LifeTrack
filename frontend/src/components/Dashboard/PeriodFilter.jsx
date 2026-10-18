import styles from './PeriodFilter.module.css';
import { useLanguage } from '../../context/LanguageContext';

export default function PeriodFilter({ selectedPeriod, onSelectPeriod, onExport, isExporting }) {
  const { t } = useLanguage();

  const periods = [
    { id: 'all', label: t('period_all') },
    { id: 'this_month', label: t('period_this_month') },
    { id: 'last_30', label: t('period_last_30') },
    { id: 'this_year', label: t('period_this_year') },
  ];

  return (
    <div className={styles.filterBar}>
      <div className={styles.periodButtons}>
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === p.id ? styles.periodBtnActive : ''}`}
            onClick={() => onSelectPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.exportBtn}
        onClick={onExport}
        disabled={isExporting}
      >
        {isExporting ? t('exporting') : t('btn_export_csv')}
      </button>
    </div>
  );
}
