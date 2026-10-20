import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './MyBookings.module.css';

export default function MyBookings() {
  const { activeCustomerId } = useRole();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookingService.getAllBookings({
      customerId: activeCustomerId,
      status: statusFilter,
    })
      .then((data) => {
        setBookings(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCustomerId, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>My Bookings</h1>
          <p>Track live service milestones, assigned partner details, and order history.</p>
        </div>

        <Link
          to="/book"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          + Book Service
        </Link>
      </div>

      <Alert message={error} type="error" />

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {['ALL', 'Assigned', 'En Route', 'Started', 'Completed'].map((status) => (
          <button
            key={status}
            type="button"
            className={`${styles.tabButton} ${statusFilter === status ? styles.tabButtonActive : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status} {status === 'ALL' && `(${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className={styles.cardContainer}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Fetching customer booking orders..." />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No Bookings Found"
              description={
                statusFilter !== 'ALL'
                  ? `No bookings match status "${statusFilter}". Try selecting "ALL" or place a new request.`
                  : 'You have not placed any service bookings yet.'
              }
              action={
                <Link to="/book" className="btn btn-primary btn-sm">
                  + Book Service
                </Link>
              }
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Address</th>
                  <th>Partner</th>
                  <th>Scheduled On</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td>
                      <code className="mono">#{b.booking_id}</code>
                    </td>
                    <td>
                      <strong>{b.service_name}</strong>
                    </td>
                    <td style={{ maxWidth: '240px', color: 'var(--text-muted)' }}>
                      {b.address}
                    </td>
                    <td>
                      {b.partner_name || <span style={{ color: 'var(--text-subtle)' }}>Auto-assigned</span>}
                    </td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td className="mono">₹{b.base_price}</td>
                    <td>
                      <div className={styles.actionLinks}>
                        <Link to={`/bookings/${b.booking_id}`} className={styles.viewLink}>
                          Details
                        </Link>
                        {b.booking_status === 'Completed' && (
                          <Link
                            to={`/ratings/new?bookingId=${b.booking_id}`}
                            className={styles.rateLink}
                          >
                            Rate ★
                          </Link>
                        )}
                      </div>
                    </td>
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
