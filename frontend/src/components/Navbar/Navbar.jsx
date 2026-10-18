import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ serverMessage }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
              <span className={styles.currencyBadge}>{user.currency || 'PLN'}</span>
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
