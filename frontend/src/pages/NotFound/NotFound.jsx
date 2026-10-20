import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The requested URL path does not exist in the Home Services Partner Management &amp; Tracking System.
          Please verify the address or navigate using the role dashboards below.
        </p>

        <div className={styles.linksGrid}>
          <Link to="/" className={styles.homeBtn}>
            &larr; Return to Home
          </Link>
          <Link to="/customer" className={styles.secondaryBtn}>
            Customer Dashboard
          </Link>
          <Link to="/partner" className={styles.secondaryBtn}>
            Partner Dashboard
          </Link>
          <Link to="/admin" className={styles.secondaryBtn}>
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
