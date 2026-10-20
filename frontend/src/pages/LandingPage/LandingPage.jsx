import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, ROLES } from '../../hooks/useRole';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleEnter = (roleKey, targetPath) => {
    setRole(roleKey);
    navigate(targetPath);
  };

  return (
    <div className={styles.container}>
      {/* Header Info Banner */}
      <section className={styles.headerSection}>
        <div className={styles.badgeRow}>
          <span className={styles.academicBadge}>DBMS Mini Project</span>
          <span className={styles.versionBadge}>MySQL 8.0 &bull; Express &bull; React</span>
        </div>
        <h1 className={styles.title}>Home Services Partner Management System</h1>
        <p className={styles.subtitle}>
          A relational database management system for on-demand home services. Features automated
          partner assignment via stored procedures, strict booking lifecycle state transitions enforced
          by database triggers, and comprehensive reporting views.
        </p>

        <div className={styles.systemTags}>
          <span className={styles.techPill}>schema.sql (12 Tables)</span>
          <span className={styles.techPill}>create_booking() Stored Procedure</span>
          <span className={styles.techPill}>trg_booking_before_update Trigger</span>
          <span className={styles.techPill}>booking_details &amp; pending_kyc Views</span>
        </div>
      </section>

      {/* Three Portal Cards */}
      <section className={styles.cardsGrid}>
        {/* 1. Customer Card */}
        <div className={styles.portalCard}>
          <div>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconCustomer}`}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className={`${styles.roleTag} ${styles.tagCustomer}`}>Customer</span>
            </div>

            <h2 className={styles.cardTitle}>Customer Portal</h2>
            <p className={styles.cardDescription}>
              Browse available service categories, book repair and maintenance appointments, track
              assigned service partners, and submit ratings for completed services.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Browse categorized services &amp; pricing</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Automated partner matching via stored procedure</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Trigger-validated ratings for completed jobs</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`${styles.enterButton} ${styles.btnCustomer}`}
            onClick={() => handleEnter(ROLES.CUSTOMER, '/customer')}
          >
            <span>Enter Customer Dashboard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* 2. Partner Card */}
        <div className={styles.portalCard}>
          <div>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconPartner}`}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <span className={`${styles.roleTag} ${styles.tagPartner}`}>Partner</span>
            </div>

            <h2 className={styles.cardTitle}>Partner Portal</h2>
            <p className={styles.cardDescription}>
              View assigned service jobs, advance service status through sequential milestones (Assigned
              &rarr; En Route &rarr; Started &rarr; Completed), and track KYC verification status.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>View assigned customer appointments</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Trigger-enforced status state progression</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>KYC submission status &amp; rating metrics</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`${styles.enterButton} ${styles.btnPartner}`}
            onClick={() => handleEnter(ROLES.PARTNER, '/partner')}
          >
            <span>Enter Partner Dashboard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* 3. Admin Card */}
        <div className={styles.portalCard}>
          <div>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconAdmin}`}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className={`${styles.roleTag} ${styles.tagAdmin}`}>Admin</span>
            </div>

            <h2 className={styles.cardTitle}>Admin Console</h2>
            <p className={styles.cardDescription}>
              Directly query SQL reporting views for comprehensive booking details, audit partner KYC
              approval queues, review partner performance aggregates, and manage catalog data.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Consolidated booking audit report view</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Pending KYC document approval queue view</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Partner rating &amp; completion metrics view</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`${styles.enterButton} ${styles.btnAdmin}`}
            onClick={() => handleEnter(ROLES.ADMIN, '/admin')}
          >
            <span>Enter Admin Dashboard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* Architecture Quick Metrics */}
      <section className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>12</span>
          <span className={styles.statLabel}>Relational Tables</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>2</span>
          <span className={styles.statLabel}>Stored Procedures</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>4</span>
          <span className={styles.statLabel}>Database Triggers</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>3</span>
          <span className={styles.statLabel}>SQL Reporting Views</span>
        </div>
      </section>
    </div>
  );
}
