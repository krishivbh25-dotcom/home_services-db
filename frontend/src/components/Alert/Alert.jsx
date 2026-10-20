import React from 'react';
import styles from './Alert.module.css';

export default function Alert({ type = 'error', message }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`${styles.alert} ${isError ? styles.error : styles.success}`} role="alert">
      <span className={styles.icon}>
        {isError ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
      </span>
      <div>{message}</div>
    </div>
  );
}
