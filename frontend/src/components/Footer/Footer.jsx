import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftText}>
        <span className={styles.projectName}>
          Home Services Partner Management &amp; Tracking System
        </span>
        <span>&bull;</span>
        <span>College DBMS Mini Project</span>
      </div>
      <div className={styles.techStack}>
        MySQL 8.0 &bull; Express REST API &bull; React
      </div>
    </footer>
  );
}
