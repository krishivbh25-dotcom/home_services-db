import React from 'react';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ message = 'Loading records from MySQL database...', compact = false }) {
  return (
    <div className={compact ? styles.wrapperCompact : styles.wrapper}>
      <div className={`${styles.spinner} ${compact ? styles.spinnerSmall : ''}`} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
