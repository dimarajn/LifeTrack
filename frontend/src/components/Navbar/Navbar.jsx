import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ serverMessage }) {
  const { user, logout, updateCurrency } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    try {
      await updateCurrency(newCurrency);
    } catch (err) {
      console.error('Failed to change currency:', err);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logoIcon}>📊</span>
        <div>
          <h1 className={styles.title}>LifeTrack</h1>
          <div className={styles.serverBadge}>
            <span className={styles.statusDot}></span>
            <span>{serverMessage || t('server_online')}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {/* Swagger Documentation Link */}
        <a
          href="http://localhost:5000/api/docs"
          target="_blank"
          rel="noreferrer"
          className={styles.docsLink}
          title="Open Swagger OpenAPI Documentation"
        >
          📖 Swagger API
        </a>

        {/* Language Switcher */}
        <div className={styles.langSwitch}>
          <button
            type="button"
            className={`${styles.langBtn} ${language === 'pl' ? styles.langBtnActive : ''}`}
            onClick={() => setLanguage('pl')}
            title="Polski"
          >
            🇵🇱 PL
          </button>
          <button
            type="button"
            className={`${styles.langBtn} ${language === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => setLanguage('en')}
            title="English"
          >
            🇬🇧 EN
          </button>
        </div>

        {user && (
          <>
            <div className={styles.userInfo}>
              <span>👤 <strong>{user.name || user.email}</strong></span>
              <select
                className={styles.currencySelect}
                value={user.currency || 'PLN'}
                onChange={handleCurrencyChange}
                title={t('main_currency')}
              >
                <option value="PLN">PLN (zł)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <button className={styles.logoutBtn} onClick={logout}>
              {t('logout')}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
