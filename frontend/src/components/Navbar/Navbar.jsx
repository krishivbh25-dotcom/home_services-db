import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRole, ROLES } from '../../hooks/useRole';
import api from '../../services/api';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { role, setRole } = useRole();
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    let isMounted = true;
    api.get('/health')
      .then((res) => {
        if (isMounted && res.data?.status === 'connected') {
          setDbStatus('DB Connected');
        }
      })
      .catch(() => {
        if (isMounted) {
          setDbStatus('DB Offline');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.brandLink}>
        <div className={styles.logo}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>
            HomeServe <span className={styles.brandHighlight}>DBMS</span>
          </span>
          <span className={styles.projectBadge}>College DBMS Mini Project</span>
        </div>
      </Link>

      <div className={styles.controlsSection}>
        {/* Role Switcher */}
        <div className={styles.roleSelector} role="group" aria-label="Role Switcher">
          <button
            type="button"
            className={`${styles.roleButton} ${
              role === ROLES.CUSTOMER ? styles.roleButtonActive : ''
            }`}
            onClick={() => setRole(ROLES.CUSTOMER)}
          >
            Customer
          </button>
          <button
            type="button"
            className={`${styles.roleButton} ${
              role === ROLES.PARTNER ? styles.roleButtonActive : ''
            }`}
            onClick={() => setRole(ROLES.PARTNER)}
          >
            Partner
          </button>
          <button
            type="button"
            className={`${styles.roleButton} ${
              role === ROLES.ADMIN ? styles.roleButtonActive : ''
            }`}
            onClick={() => setRole(ROLES.ADMIN)}
          >
            Admin
          </button>
        </div>

        {/* Database Status Badge */}
        <div className={styles.systemStatus}>
          <span className={styles.statusDot} />
          <span>{dbStatus}</span>
        </div>
      </div>
    </header>
  );
}
