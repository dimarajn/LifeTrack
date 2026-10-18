import { useState, useRef, useEffect } from 'react';
import styles from './PeriodFilter.module.css';
import { useLanguage } from '../../context/LanguageContext';

export default function PeriodFilter({
  selectedPeriod,
  onSelectPeriod,
  onExport,
  isExporting
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [specificDay, setSpecificDay] = useState(todayStr);
  const [rangeFrom, setRangeFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [rangeTo, setRangeTo] = useState(todayStr);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (presetId) => {
    onSelectPeriod(presetId, null);
    setIsOpen(false);
  };

  const handleDaySelect = (day) => {
    setSpecificDay(day);
    onSelectPeriod('day', { from: day, to: day });
    setIsOpen(false);
  };

  const handleApplyRange = (e) => {
    e.preventDefault();
    if (rangeFrom && rangeTo) {
      onSelectPeriod('custom_range', { from: rangeFrom, to: rangeTo });
      setIsOpen(false);
    }
  };

  // Label displayed on the main button
  const getButtonLabel = () => {
    switch (selectedPeriod) {
      case 'this_month':
        return `📊 ${t('period_this_month')}`;
      case 'this_week':
        return `🗓️ ${t('period_this_week')}`;
      case 'day':
        return `📅 ${specificDay}`;
      case 'custom_range':
        return `⏳ ${rangeFrom} → ${rangeTo}`;
      case 'all':
        return `🌐 ${t('period_all')}`;
      default:
        return `📊 ${t('period_this_month')}`;
    }
  };

  return (
    <div className={styles.filterBar}>
      {/* Dropdown Menu Container */}
      <div className={styles.dropdownWrapper} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.triggerBtn} ${isOpen ? styles.triggerBtnOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={styles.triggerText}>{getButtonLabel()}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.popupMenu}>
            {/* Quick Presets */}
            <button
              type="button"
              className={`${styles.menuItem} ${selectedPeriod === 'this_month' ? styles.menuItemActive : ''}`}
              onClick={() => handleSelectPreset('this_month')}
            >
              <span className={styles.itemLabel}>📊 {t('period_this_month')}</span>
              {selectedPeriod === 'this_month' && <span className={styles.checkMark}>✓</span>}
            </button>

            <button
              type="button"
              className={`${styles.menuItem} ${selectedPeriod === 'this_week' ? styles.menuItemActive : ''}`}
              onClick={() => handleSelectPreset('this_week')}
            >
              <span className={styles.itemLabel}>🗓️ {t('period_this_week')}</span>
              {selectedPeriod === 'this_week' && <span className={styles.checkMark}>✓</span>}
            </button>

            <button
              type="button"
              className={`${styles.menuItem} ${selectedPeriod === 'all' ? styles.menuItemActive : ''}`}
              onClick={() => handleSelectPreset('all')}
            >
              <span className={styles.itemLabel}>🌐 {t('period_all')}</span>
              {selectedPeriod === 'all' && <span className={styles.checkMark}>✓</span>}
            </button>

            <div className={styles.divider} />

            {/* Specific Day Picker */}
            <div className={styles.subSection}>
              <span className={styles.subTitle}>📅 {t('period_single_day')}</span>
              <div className={styles.dateRow}>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={specificDay}
                  onChange={(e) => handleDaySelect(e.target.value)}
                />
              </div>
            </div>

            {/* Custom Date Range Picker */}
            <form className={styles.subSection} onSubmit={handleApplyRange}>
              <span className={styles.subTitle}>⏳ {t('period_custom_range')}</span>
              <div className={styles.dateRow}>
                <label style={{ minWidth: '24px' }}>{t('from_date')}:</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  required
                />
              </div>
              <div className={styles.dateRow}>
                <label style={{ minWidth: '24px' }}>{t('to_date')}:</label>
                <input
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
          </div>
        )}
      </div>

      {/* CSV Export Button */}
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
