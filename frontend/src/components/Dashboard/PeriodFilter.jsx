import { useState, useRef, useEffect } from 'react';
import styles from './PeriodFilter.module.css';
import { useLanguage } from '../../context/LanguageContext';

export default function PeriodFilter({
  selectedPeriod,
  onSelectPeriod,
  onOpenNewTransaction
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

  const getButtonLabel = () => {
    switch (selectedPeriod) {
      case 'this_month':
        return t('period_this_month');
      case 'this_week':
        return t('period_this_week');
      case 'day':
        return specificDay;
      case 'custom_range':
        return `${rangeFrom} — ${rangeTo}`;
      case 'all':
        return t('period_all');
      default:
        return t('period_this_month');
    }
  };

  return (
    <div className={styles.topToolbar}>
      <h2 className={styles.sectionHeading}>{t('dashboard_overview')}</h2>

      <div className={styles.toolbarRight}>
        {/* Period Popover */}
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={`${styles.triggerBtn} ${isOpen ? styles.triggerBtnOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.calendarIcon}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className={styles.triggerText}>{getButtonLabel()}</span>
            <svg
              className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isOpen && (
            <div className={styles.popupMenu}>
              <button
                type="button"
                className={`${styles.menuItem} ${selectedPeriod === 'this_month' ? styles.menuItemActive : ''}`}
                onClick={() => handleSelectPreset('this_month')}
              >
                <span>{t('period_this_month')}</span>
                {selectedPeriod === 'this_month' && <span className={styles.checkMark}>✓</span>}
              </button>

              <button
                type="button"
                className={`${styles.menuItem} ${selectedPeriod === 'this_week' ? styles.menuItemActive : ''}`}
                onClick={() => handleSelectPreset('this_week')}
              >
                <span>{t('period_this_week')}</span>
                {selectedPeriod === 'this_week' && <span className={styles.checkMark}>✓</span>}
              </button>

              <button
                type="button"
                className={`${styles.menuItem} ${selectedPeriod === 'all' ? styles.menuItemActive : ''}`}
                onClick={() => handleSelectPreset('all')}
              >
                <span>{t('period_all')}</span>
                {selectedPeriod === 'all' && <span className={styles.checkMark}>✓</span>}
              </button>

              <div className={styles.divider} />

              <div className={styles.subSection}>
                <span className={styles.subTitle}>{t('period_single_day')}</span>
                <div className={styles.dateRow}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={specificDay}
                    onChange={(e) => handleDaySelect(e.target.value)}
                  />
                </div>
              </div>

              <form className={styles.subSection} onSubmit={handleApplyRange}>
                <span className={styles.subTitle}>{t('period_custom_range')}</span>
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

        {/* Primary CTA Button: + New Transaction */}
        <button
          type="button"
          className={styles.newTxBtn}
          onClick={onOpenNewTransaction}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{t('btn_new_transaction')}</span>
        </button>
      </div>
    </div>
  );
}
