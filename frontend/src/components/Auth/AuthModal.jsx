import { useState } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AuthModal() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PLN');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, currency);
      }
    } catch (err) {
      setError(err.message || t('auth_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@lifetrack.app', 'password123');
    } catch (err) {
      setError(err.message || t('demo_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>{t('auth_title')}</h2>
      <p className={styles.subtitle}>{t('auth_subtitle')}</p>

      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabBtn} ${isLogin ? styles.tabBtnActive : ''}`}
          onClick={() => { setIsLogin(true); setError(''); }}
          type="button"
        >
          {t('tab_login')}
        </button>
        <button
          className={`${styles.tabBtn} ${!isLogin ? styles.tabBtnActive : ''}`}
          onClick={() => { setIsLogin(false); setError(''); }}
          type="button"
        >
          {t('tab_register')}
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('your_name')}</label>
              <input
                className={styles.input}
                type="text"
                placeholder={t('name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('main_currency')}</label>
              <select
                className={styles.input}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="PLN">PLN (zł)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t('email')}</label>
          <input
            className={styles.input}
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t('password')}</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? t('loading') : isLogin ? t('btn_login') : t('btn_register')}
        </button>
      </form>

      <button className={styles.demoBtn} type="button" onClick={handleDemoLogin} disabled={loading}>
        {t('demo_login')}
      </button>
    </div>
  );
}
