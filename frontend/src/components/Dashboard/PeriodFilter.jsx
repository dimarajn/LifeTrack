import { useState } from 'react';
import styles from './PeriodFilter.module.css';
import { useLanguage } from '../../context/LanguageContext';

export default function PeriodFilter({
  selectedPeriod,
  onSelectPeriod,
  onExport,
  isExporting
}) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [specificDay, setSpecificDay] = useState(todayStr);
  const [rangeFrom, setRangeFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [rangeTo, setRangeTo] = useState(todayStr);

  const handlePresetClick = (presetId) => {
    if (presetId === 'day') {
      onSelectPeriod('day', { from: specificDay, to: specificDay });
    } else if (presetId === 'custom_range') {
      onSelectPeriod('custom_range', { from: rangeFrom, to: rangeTo });
    } else {
      onSelectPeriod(presetId, null);
    }
  };

  const handleDayChange = (e) => {
    const newDay = e.target.value;
    setSpecificDay(newDay);
    if (newDay) {
      onSelectPeriod('day', { from: newDay, to: newDay });
    }
  };

  const handleApplyRange = (e) => {
    e.preventDefault();
    if (rangeFrom && rangeTo) {
      onSelectPeriod('custom_range', { from: rangeFrom, to: rangeTo });
    }
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.mainBar}>
        <div className={styles.periodButtons}>
          <button
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === 'this_month' ? styles.periodBtnActive : ''}`}
            onClick={() => handlePresetClick('this_month')}
          >
            📊 {t('period_this_month')}
          </button>

          <button
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === 'this_week' ? styles.periodBtnActive : ''}`}
            onClick={() => handlePresetClick('this_week')}
          >
            🗓️ {t('period_this_week')}
          </button>

          <button
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === 'day' ? styles.periodBtnActive : ''}`}
            onClick={() => handlePresetClick('day')}
          >
            📅 {t('period_single_day')}
          </button>

          <button
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === 'custom_range' ? styles.periodBtnActive : ''}`}
            onClick={() => handlePresetClick('custom_range')}
          >
            ⏳ {t('period_custom_range')}
          </button>

          <button
            type="button"
            className={`${styles.periodBtn} ${selectedPeriod === 'all' ? styles.periodBtnActive : ''}`}
            onClick={() => handlePresetClick('all')}
          >
            🌐 {t('period_all')}
          </button>
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

      {/* Sub-controls when 'day' is selected */}
      {selectedPeriod === 'day' && (
        <div className={styles.subControls}>
          <div className={styles.dateGroup}>
            <label htmlFor="dayPicker">{t('select_day')}:</label>
            <input
              id="dayPicker"
              type="date"
              className={styles.dateInput}
              value={specificDay}
              onChange={handleDayChange}
            />
          </div>
        </div>
      )}

      {/* Sub-controls when 'custom_range' is selected */}
      {selectedPeriod === 'custom_range' && (
        <form className={styles.subControls} onSubmit={handleApplyRange}>
          <div className={styles.dateGroup}>
            <label htmlFor="fromPicker">{t('from_date')}:</label>
            <input
              id="fromPicker"
              type="date"
              className={styles.dateInput}
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              required
            />
          </div>

          <div className={styles.dateGroup}>
            <label htmlFor="toPicker">{t('to_date')}:</label>
            <input
              id="toPicker"
              type="date"
              className={styles.dateInput}
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.applyBtn}>
            {t('apply_filter')}
          </button>
        </form>
      )}
    </div>
  );
}
