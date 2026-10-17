import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ serverMessage }) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logoIcon}>📊</span>
        <div>
          <h1 className={styles.title}>LifeTrack</h1>
          <div className={styles.serverBadge}>
            <span className={styles.statusDot}></span>
            <span>{serverMessage || 'Server Online'}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {user && (
          <>
            <div className={styles.userInfo}>
              <span>👤 <strong>{user.name || user.email}</strong></span>
              <span className={styles.currencyBadge}>{user.currency || 'PLN'}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logout}>
              Выйти
            </button>
          </>
        )}
      </div>
    </header>
  );
}
