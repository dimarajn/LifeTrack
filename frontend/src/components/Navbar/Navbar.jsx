import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../api/client';

export default function Navbar({
  serverMessage,
  onOpenCategories,
  onExportCsv,
  isExporting
}) {
  const { user, logout, updateCurrency, updateBudget, deleteAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setEditingBudget(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCurrencySelect = async (curr) => {
    try {
      await updateCurrency(curr);
    } catch (err) {
      console.error('Failed to change currency:', err);
    }
  };

  const handleBudgetSave = async (e) => {
    e.preventDefault();
    try {
      const val = budgetInput.trim() === '' ? null : Number(budgetInput);
      await updateBudget(val);
      setEditingBudget(false);
    } catch (err) {
      console.error('Failed to save budget:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.email === 'demo@lifetrack.app') {
      alert(t('delete_account_demo_error'));
      return;
    }
    if (window.confirm(t('delete_account_confirm'))) {
      try {
        await deleteAccount();
        setMenuOpen(false);
      } catch (err) {
        alert(err.message || 'Error');
      }
    }
  };

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();
  const isOnline = !serverMessage || !serverMessage.includes('offline');

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className={styles.title}>LifeTrack</span>
        <span
          className={`${styles.statusDot} ${isOnline ? styles.statusOnline : styles.statusOffline}`}
          title={serverMessage || t('server_online')}
        />
      </div>

      <div className={styles.actions}>
        {!user ? (
          <div className={styles.langSwitch}>
            <button
              type="button"
              className={`${styles.langBtn} ${language === 'pl' ? styles.langBtnActive : ''}`}
              onClick={() => setLanguage('pl')}
            >
              PL
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${language === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
        ) : (
          <div className={styles.profileWrapper} ref={menuRef}>
            <button
              type="button"
              className={`${styles.profileTrigger} ${menuOpen ? styles.profileTriggerActive : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={styles.avatar}>{initial}</span>
              <span className={styles.userName}>{user.name || user.email.split('@')[0]}</span>
              <span className={styles.currencyPill}>{user.currency || 'PLN'}</span>
              <svg
                className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                {/* User Identity Header */}
                <div className={styles.dropdownUserHeader}>
                  <div className={styles.avatarLarge}>{initial}</div>
                  <div className={styles.userMeta}>
                    <div className={styles.userFull}>{user.name || 'User'}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>

                <div className={styles.divider} />

                {/* Currency Segmented Control */}
                <div className={styles.controlSection}>
                  <span className={styles.sectionLabel}>{t('menu_currency')}</span>
                  <div className={styles.segmentedGroup}>
                    {['PLN', 'EUR', 'USD', 'GBP'].map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        className={`${styles.segmentBtn} ${(user.currency || 'PLN') === curr ? styles.segmentBtnActive : ''}`}
                        onClick={() => handleCurrencySelect(curr)}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Segmented Control */}
                <div className={styles.controlSection}>
                  <span className={styles.sectionLabel}>{t('menu_language')}</span>
                  <div className={styles.segmentedGroup}>
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${language === 'pl' ? styles.segmentBtnActive : ''}`}
                      onClick={() => setLanguage('pl')}
                    >
                      Polski (PL)
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentBtn} ${language === 'en' ? styles.segmentBtnActive : ''}`}
                      onClick={() => setLanguage('en')}
                    >
                      English (EN)
                    </button>
                  </div>
                </div>

                <div className={styles.divider} />

                {/* Monthly Budget Inline Setting */}
                <div className={styles.budgetMenuSection}>
                  {!editingBudget ? (
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setBudgetInput(user.monthlyBudget ? String(user.monthlyBudget) : '');
                        setEditingBudget(true);
                      }}
                    >
                      <span className={styles.menuItemLeft}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        <span>{t('menu_budget')}</span>
                      </span>
                      <span className={styles.menuValueBadge}>
                        {user.monthlyBudget ? `${user.monthlyBudget} ${user.currency || 'PLN'}` : '—'}
                      </span>
                    </button>
                  ) : (
                    <form className={styles.inlineBudgetForm} onSubmit={handleBudgetSave}>
                      <span className={styles.sectionLabel}>{t('menu_budget')} ({user.currency || 'PLN'})</span>
                      <div className={styles.inlineBudgetRow}>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="np. 3000"
                          className={styles.inlineBudgetInput}
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          autoFocus
                        />
                        <button type="submit" className={styles.inlineBudgetSave}>OK</button>
                        {user.monthlyBudget && (
                          <button
                            type="button"
                            className={styles.inlineBudgetClear}
                            onClick={async () => {
                              await updateBudget(null);
                              setEditingBudget(false);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>

                {/* Categories */}
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCategories();
                  }}
                >
                  <span className={styles.menuItemLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>{t('menu_categories')}</span>
                  </span>
                </button>

                {/* CSV Export */}
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onExportCsv();
                  }}
                  disabled={isExporting}
                >
                  <span className={styles.menuItemLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{isExporting ? t('exporting') : t('menu_export_csv')}</span>
                  </span>
                </button>

                {/* Swagger API Docs */}
                <a
                  href={`${API_BASE_URL}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.menuItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.menuItemLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>{t('menu_api_docs')}</span>
                  </span>
                </a>

                <div className={styles.divider} />

                {/* Logout */}
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemLogout}`}
                  onClick={logout}
                >
                  <span className={styles.menuItemLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{t('logout')}</span>
                  </span>
                </button>

                {/* RODO Delete Account */}
                {user.email !== 'demo@lifetrack.app' && (
                  <button
                    type="button"
                    className={styles.rodoDeleteLink}
                    onClick={handleDeleteAccount}
                  >
                    {t('menu_delete_account')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
