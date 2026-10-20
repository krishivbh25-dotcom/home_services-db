import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerService, bookingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PartnerDashboard.module.css';

export default function PartnerDashboard() {
  const { activePartnerId, setActivePartnerId } = useRole();
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [partnerRatings, setPartnerRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load partners list
  useEffect(() => {
    partnerService.getAllPartners()
      .then((data) => {
        setPartners(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Load bookings and ratings view for active partner
  useEffect(() => {
    if (!activePartnerId) return;
    setLoading(true);
    Promise.all([
      bookingService.getAllBookings({ partnerId: activePartnerId }),
      partnerService.getPartnerRatings(),
    ])
      .then(([bookingsData, ratingsData]) => {
        setBookings(bookingsData);
        setPartnerRatings(ratingsData);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activePartnerId]);

  const currentPartner = partners.find((p) => p.partner_id === activePartnerId);
  const ratingMetric = partnerRatings.find((r) => r.partner_id === activePartnerId);

  // Categorize jobs
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysJobs = bookings.filter((b) => String(b.scheduled_on).startsWith(todayStr));
  const pendingJobs = bookings.filter(
    (b) => b.booking_status === 'Assigned' || b.booking_status === 'En Route' || b.booking_status === 'Started'
  );
  const completedJobs = bookings.filter((b) => b.booking_status === 'Completed');

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Partner Dashboard</h1>
          <p>
            Welcome, <strong>{currentPartner?.name || 'Partner'}</strong> ({currentPartner?.category_name || 'Home Services'})
          </p>
        </div>

        {/* Switch Partner Dropdown */}
        <div className={styles.partnerPicker}>
          <label htmlFor="partnerSelect" className={styles.pickerLabel}>
            Acting As:
          </label>
          <select
            id="partnerSelect"
            className={styles.selectInput}
            value={activePartnerId}
            onChange={(e) => setActivePartnerId(Number(e.target.value))}
          >
            {partners.map((p) => (
              <option key={p.partner_id} value={p.partner_id}>
                {p.name} — {p.category_name} ({p.verification_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Alert message={error} type="error" />

      {/* Quick Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Today's Jobs</span>
          <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
            {todaysJobs.length}
          </span>
          <span className={styles.statSubtext}>Scheduled for {todayStr}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending / In Progress</span>
          <span className={styles.statValue} style={{ color: 'var(--color-accent)' }}>
            {pendingJobs.length}
          </span>
          <span className={styles.statSubtext}>Assigned, en route, or started</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed Jobs</span>
          <span className={styles.statValue} style={{ color: 'var(--badge-success-text)' }}>
            {completedJobs.length}
          </span>
          <span className={styles.statSubtext}>Total jobs finished</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Rating</span>
          <span className={styles.statValue}>
            {ratingMetric ? `${Number(ratingMetric.avg_score).toFixed(1)} ★` : 'Unrated'}
          </span>
          <span className={styles.statSubtext}>
            {ratingMetric ? `${ratingMetric.total_ratings} reviews received` : '0 ratings recorded'}
          </span>
        </div>
      </div>

      {/* Pending / Active Jobs */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active &amp; Pending Jobs ({pendingJobs.length})</h2>
          <Link to="/partner/jobs" className={styles.actionButton}>
            Manage Status &rarr;
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Loading assigned jobs from MySQL..." />
          ) : pendingJobs.length === 0 ? (
            <EmptyState
              title="No Pending Jobs"
              description="No active jobs currently in Assigned, En Route, or Started status."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Scheduled On</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((b) => (
                  <tr key={b.booking_id}>
                    <td>
                      <code className="mono">#{b.booking_id}</code>
                    </td>
                    <td>
                      <strong>{b.service_name}</strong>
                    </td>
                    <td>{b.customer_name}</td>
                    <td style={{ maxWidth: '240px' }}>{b.address}</td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td>
                      <Link to={`/partner/jobs/${b.booking_id}`} className={styles.primaryLink}>
                        Job Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Completed Jobs */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Completed Jobs ({completedJobs.length})</h2>
          <Link to="/partner/jobs" className={styles.actionButton}>
            View All Jobs &rarr;
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Loading job history..." />
          ) : completedJobs.length === 0 ? (
            <EmptyState
              title="No Completed Jobs"
              description="Jobs transitioned to Completed status will be archived here."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.slice(0, 5).map((b) => (
                  <tr key={b.booking_id}>
                    <td>
                      <code className="mono">#{b.booking_id}</code>
                    </td>
                    <td>{b.service_name}</td>
                    <td>{b.customer_name}</td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td className="mono">₹{b.base_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
