import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, API_BASE_URL } from '../../api/client';

// Reference ECB rates relative to PLN for instant 0ms conversion between any pair
const PLN_RATES = { PLN: 1, EUR: 0.228, USD: 0.255, GBP: 0.191 };

const LANGUAGES = [
  { code: 'pl', label: 'Polski', badge: 'PL' },
  { code: 'en', label: 'English', badge: 'EN' },
  { code: 'es', label: 'Español', badge: 'ES' },
];

const CURRENCIES = [
  { code: 'PLN', label: 'PLN — Polski złoty (zł)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
];

export default function Navbar({
  serverMessage,
  onOpenCategories,
  onExportCsv,
  isExporting,
  onInstantConvert
}) {
  const { user, logout, updateCurrency, updateBudget, deleteAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Accordion sub-menus inside Settings gear
  const [openSubMenu, setOpenSubMenu] = useState(null); // 'lang' | 'currency' | 'budget' | null
  const [budgetInput, setBudgetInput] = useState('');
  const [plnBaseRates, setPlnBaseRates] = useState(PLN_RATES);

  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch live ECB rates relative to PLN once so any currency pair converts in 0ms
  useEffect(() => {
    api.getExchangeRates('PLN')
      .then(data => {
        if (data?.rates) {
          setPlnBaseRates({ ...PLN_RATES, ...data.rates, PLN: 1 });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
        setOpenSubMenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCurrencySelect = (targetCurr) => {
    const oldCurr = user?.currency || 'PLN';
    if (oldCurr === targetCurr) {
      setOpenSubMenu(null);
      return;
    }

    // Instant 0ms cross-rate calculation via PLN base
    const fromRate = plnBaseRates[oldCurr] || PLN_RATES[oldCurr] || 1;
    const toRate = plnBaseRates[targetCurr] || PLN_RATES[targetCurr] || 1;
    const rate = toRate / fromRate;

    if (onInstantConvert) {
      onInstantConvert(targetCurr, rate);
    }
    updateCurrency(targetCurr, rate);
    setOpenSubMenu(null);
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    setOpenSubMenu(null);
  };

  const handleBudgetSave = async (e) => {
    e.preventDefault();
    try {
      const val = budgetInput.trim() === '' ? null : Number(budgetInput);
      await updateBudget(val);
      setOpenSubMenu(null);
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
        setProfileOpen(false);
      } catch (err) {
        alert(err.message || 'Error');
      }
    }
  };

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();
  const isOnline = !serverMessage || !serverMessage.includes('offline');
  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const currentCurr = user?.currency || 'PLN';

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
          /* Public Language Dropdown when logged out */
          <div className={styles.menuWrapper} ref={settingsRef}>
            <button
              type="button"
              className={`${styles.langTriggerBtn} ${settingsOpen ? styles.langTriggerActive : ''}`}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{currentLangObj.badge}</span>
              <svg
                className={`${styles.chevron} ${settingsOpen ? styles.chevronOpen : ''}`}
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

            {settingsOpen && (
              <div className={styles.langPopup}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${styles.subMenuItem} ${language === l.code ? styles.subMenuItemActive : ''}`}
                    onClick={() => {
                      handleLanguageSelect(l.code);
                      setSettingsOpen(false);
                    }}
                  >
                    <span>{l.label} ({l.badge})</span>
                    {language === l.code && <span className={styles.checkIcon}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Settings Gear Button when logged in */
          <div className={styles.menuWrapper} ref={settingsRef}>
            <button
              type="button"
              className={`${styles.gearBtn} ${settingsOpen ? styles.gearBtnActive : ''}`}
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setProfileOpen(false);
              }}
              title={t('menu_settings')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {settingsOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeaderTitle}>{t('menu_settings')}</div>

                {/* 1. Expandable Language Item */}
                <div className={styles.accordionBlock}>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${openSubMenu === 'lang' ? styles.menuItemExpanded : ''}`}
                    onClick={() => setOpenSubMenu(openSubMenu === 'lang' ? null : 'lang')}
                  >
                    <span className={styles.menuItemLeft}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span>{t('menu_language')}</span>
                    </span>
                    <span className={styles.menuItemRight}>
                      <span className={styles.menuValueBadge}>{currentLangObj.label}</span>
                      <svg
                        className={`${styles.subArrow} ${openSubMenu === 'lang' ? styles.subArrowOpen : ''}`}
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {openSubMenu === 'lang' && (
                    <div className={styles.subMenuList}>
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          className={`${styles.subMenuItem} ${language === l.code ? styles.subMenuItemActive : ''}`}
                          onClick={() => handleLanguageSelect(l.code)}
                        >
                          <span>{l.label} ({l.badge})</span>
                          {language === l.code && <span className={styles.checkIcon}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Expandable Currency Item */}
                <div className={styles.accordionBlock}>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${openSubMenu === 'currency' ? styles.menuItemExpanded : ''}`}
                    onClick={() => setOpenSubMenu(openSubMenu === 'currency' ? null : 'currency')}
                  >
                    <span className={styles.menuItemLeft}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span>{t('menu_currency')}</span>
                    </span>
                    <span className={styles.menuItemRight}>
                      <span className={styles.menuValueBadge}>{currentCurr}</span>
                      <svg
                        className={`${styles.subArrow} ${openSubMenu === 'currency' ? styles.subArrowOpen : ''}`}
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {openSubMenu === 'currency' && (
                    <div className={styles.subMenuList}>
                      {CURRENCIES.map((c) => {
                        const fromR = plnBaseRates[currentCurr] || 1;
                        const toR = plnBaseRates[c.code] || 1;
                        const previewRate = (toR / fromR).toFixed(2);
                        return (
                          <button
                            key={c.code}
                            type="button"
                            className={`${styles.subMenuItem} ${currentCurr === c.code ? styles.subMenuItemActive : ''}`}
                            onClick={() => handleCurrencySelect(c.code)}
                          >
                            <span>{c.label}</span>
                            {currentCurr === c.code ? (
                              <span className={styles.checkIcon}>✓</span>
                            ) : (
                              <span className={styles.rateTag}>×{previewRate}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Expandable Monthly Budget Limit */}
                <div className={styles.accordionBlock}>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${openSubMenu === 'budget' ? styles.menuItemExpanded : ''}`}
                    onClick={() => {
                      setBudgetInput(user.monthlyBudget ? String(user.monthlyBudget) : '');
                      setOpenSubMenu(openSubMenu === 'budget' ? null : 'budget');
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
                      {user.monthlyBudget ? `${user.monthlyBudget} ${currentCurr}` : '—'}
                    </span>
                  </button>

                  {openSubMenu === 'budget' && (
                    <form className={styles.inlineBudgetForm} onSubmit={handleBudgetSave}>
                      <div className={styles.inlineBudgetRow}>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          placeholder={`${t('budget_placeholder')} (${currentCurr})`}
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
                              setOpenSubMenu(null);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>

                <div className={styles.divider} />

                {/* Categories */}
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setSettingsOpen(false);
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
                    setSettingsOpen(false);
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
                  onClick={() => setSettingsOpen(false)}
                >
                  <span className={styles.menuItemLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>{t('menu_api_docs')}</span>
                  </span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* User Profile Button */}
        {user && (
          <div className={styles.menuWrapper} ref={profileRef}>
            <button
              type="button"
              className={`${styles.profileTrigger} ${profileOpen ? styles.profileTriggerActive : ''}`}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setSettingsOpen(false);
              }}
            >
              <span className={styles.avatar}>{initial}</span>
              <span className={styles.userName}>{user.name || user.email.split('@')[0]}</span>
              <span className={styles.currencyPill}>{currentCurr}</span>
              <svg
                className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`}
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

            {profileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.dropdownUserHeader}>
                  <div className={styles.avatarLarge}>{initial}</div>
                  <div className={styles.userMeta}>
                    <div className={styles.userFull}>{user.name || 'User'}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>

                <div className={styles.divider} />

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
