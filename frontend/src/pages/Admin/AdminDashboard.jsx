import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [bookingDetails, setBookingDetails] = useState([]);
  const [pendingKyc, setPendingKyc] = useState([]);
  const [partnerRatings, setPartnerRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getBookingDetails(),
      adminService.getPendingKyc(),
      adminService.getPartnerRatings(),
    ])
      .then(([bookingsData, kycData, ratingsData]) => {
        setBookingDetails(bookingsData);
        setPendingKyc(kycData);
        setPartnerRatings(ratingsData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute metrics
  const totalBookings = bookingDetails.length;
  const pendingKycCount = pendingKyc.length;
  const totalPartners = partnerRatings.length;

  const validRatings = partnerRatings.filter((r) => r.avg_score !== null && r.total_ratings > 0);
  const systemAvgRating =
    validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + Number(r.avg_score), 0) / validRatings.length).toFixed(2)
      : 'N/A';

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Admin &amp; Reporting Console</h1>
          <p>Direct view querying, database audit logs, compliance oversight, and partner performance metrics.</p>
        </div>
        <div className={styles.adminBadge}>Administrator Mode</div>
      </div>

      <Alert message={error} type="error" />

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total System Bookings</span>
          <span className={styles.statValue}>{loading ? '...' : totalBookings}</span>
          <span className={styles.statSubtext}>From booking_details view</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending KYC Verifications</span>
          <span className={styles.statValue} style={{ color: 'var(--color-accent)' }}>
            {loading ? '...' : pendingKycCount}
          </span>
          <span className={styles.statSubtext}>From pending_kyc view</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Service Partners</span>
          <span className={styles.statValue}>{loading ? '...' : totalPartners}</span>
          <span className={styles.statSubtext}>Across all categories</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>System Average Rating</span>
          <span className={styles.statValue} style={{ color: 'var(--badge-success-text)' }}>
            {loading ? '...' : `${systemAvgRating} ★`}
          </span>
          <span className={styles.statSubtext}>From partner_ratings view</span>
        </div>
      </div>

      {loading && <LoadingSpinner message="Executing MySQL audit queries on administrative views..." />}

      {/* SQL Reporting Views Navigation Cards */}
      <div className={styles.viewsGrid}>
        {/* 1. Booking Details View */}
        <div className={styles.viewCard}>
          <div>
            <div className={styles.viewTop}>
              <span className={styles.sqlPill}>VIEW: booking_details</span>
              <span className={styles.countPill}>{totalBookings} records</span>
            </div>
            <h2 className={styles.viewTitle}>Booking Audit &amp; Details</h2>
            <p className={styles.viewDesc}>
              Comprehensive reporting join across Booking, Customer, Service, Category, Address, Partner,
              and Rating tables with full status and cost details.
            </p>
          </div>
          <Link to="/booking-details" className={styles.viewBtn}>
            <span>Open Booking Details Table</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* 2. Pending KYC View */}
        <div className={styles.viewCard}>
          <div>
            <div className={styles.viewTop}>
              <span className={styles.sqlPill}>VIEW: pending_kyc</span>
              <span className={styles.countPill} style={{ color: 'var(--color-accent)' }}>
                {pendingKycCount} pending
              </span>
            </div>
            <h2 className={styles.viewTitle}>Pending KYC Approvals</h2>
            <p className={styles.viewDesc}>
              Aggregated view of all service partners with verification_status = 'Pending', counting
              uploaded documents and listing compliance certificate types.
            </p>
          </div>
          <Link to="/pending-kyc" className={styles.viewBtn}>
            <span>Open Pending KYC Table</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* 3. Partner Ratings View */}
        <div className={styles.viewCard}>
          <div>
            <div className={styles.viewTop}>
              <span className={styles.sqlPill}>VIEW: partner_ratings</span>
              <span className={styles.countPill}>{totalPartners} partners</span>
            </div>
            <h2 className={styles.viewTitle}>Partner Performance Ratings</h2>
            <p className={styles.viewDesc}>
              Analytical summary calculating total ratings received, average score (rounded to 2 decimal
              places), and distinct completed booking counts per technician.
            </p>
          </div>
          <Link to="/partner-ratings" className={styles.viewBtn}>
            <span>Open Partner Ratings Table</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Relational Database Summary Table */}
      <div className={styles.schemaCard}>
        <h2 className={styles.schemaTitle}>Database Objects &amp; Logic Summary</h2>
        <table className={styles.schemaTable}>
          <thead>
            <tr>
              <th>Object Type</th>
              <th>Object Identifier</th>
              <th>Enforcement &amp; Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className={styles.sqlPill}>Stored Procedure</span>
              </td>
              <td>
                <code>create_booking(customer_id, service_id, address_id, scheduled_on)</code>
              </td>
              <td>Auto-assigns verified &amp; available partner, validates future date and address ownership.</td>
            </tr>
            <tr>
              <td>
                <span className={styles.sqlPill}>Stored Procedure</span>
              </td>
              <td>
                <code>assign_partner(booking_id, partner_id)</code>
              </td>
              <td>Assigns verified partner to existing booking and transitions status to Assigned.</td>
            </tr>
            <tr>
              <td>
                <span className={styles.sqlPill} style={{ color: 'var(--color-accent)' }}>
                  Trigger
                </span>
              </td>
              <td>
                <code>trg_booking_before_update</code>
              </td>
              <td>
                Strictly enforces lifecycle: <code>Assigned &rarr; En Route &rarr; Started &rarr; Completed</code>.
              </td>
            </tr>
            <tr>
              <td>
                <span className={styles.sqlPill} style={{ color: 'var(--color-accent)' }}>
                  Trigger
                </span>
              </td>
              <td>
                <code>trg_rating_before_insert</code>
              </td>
              <td>Guarantees ratings can only be inserted for Completed bookings.</td>
            </tr>
            <tr>
              <td>
                <span className={styles.sqlPill} style={{ color: 'var(--badge-success-text)' }}>
                  Trigger
                </span>
              </td>
              <td>
                <code>trg_booking_after_insert / after_update</code>
              </td>
              <td>Automatically logs append-only audit trail in <code>Job_Tracking</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
