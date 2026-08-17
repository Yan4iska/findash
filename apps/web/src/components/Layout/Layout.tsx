import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth.js';
import { useAuthStore } from '../../stores/authStore.js';
import { Button } from '../Button/Button.js';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/categories', label: 'Categories' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/forecast', label: 'Forecast' },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/dashboard" className={styles.logo}>
            FinDash
          </Link>

          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>

          <nav className={[styles.nav, menuOpen ? styles.navOpen : ''].filter(Boolean).join(' ')}>
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {user?.name && <span className={styles.userName}>{user.name}</span>}
            <Button variant="ghost" small onClick={() => void handleLogout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
