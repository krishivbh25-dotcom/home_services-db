import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './AssignedJobs.module.css';

const ALL_STATUSES = ['Assigned', 'En Route', 'Started', 'Completed'];

export default function AssignedJobs() {
  const { activePartnerId } = useRole();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStatusMap, setSelectedStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchBookings = () => {
    if (!activePartnerId) return;
    setLoading(true);
    bookingService.getAllBookings({
      partnerId: activePartnerId,
      status: statusFilter,
    })
      .then((data) => {
        setBookings(data);
        const initialMap = {};
        data.forEach((b) => {
          initialMap[b.booking_id] = b.booking_status;
        });
        setSelectedStatusMap(initialMap);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [activePartnerId, statusFilter]);

  const handleStatusChange = (bookingId, newStatus) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [bookingId]: newStatus,
    }));
  };

  const handleUpdateStatus = async (bookingId) => {
    const newStatus = selectedStatusMap[bookingId];
    setError(null);
    setSuccess(null);
    setUpdatingId(bookingId);

    try {
      const updated = await bookingService.updateBookingStatus(bookingId, newStatus);
      const successMsg = `Booking #${bookingId} status updated to "${updated.booking_status}" successfully.`;
      setSuccess(successMsg);
      toast.success(successMsg);
      fetchBookings();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Assigned Service Jobs</h1>
          <p>
            Update customer job statuses as work progresses. Transitions are verified and audited by MySQL triggers.
          </p>
        </div>
      </div>

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

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

      {/* Jobs Table */}
      <div className={styles.cardContainer}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Fetching technician job assignments..." />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No Assigned Jobs"
              description={
                statusFilter !== 'ALL'
                  ? `No jobs match status "${statusFilter}" for this partner profile.`
                  : 'You have no active or completed jobs assigned in the system.'
              }
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service Details</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Scheduled On</th>
                  <th>Current Status</th>
                  <th>Update Status (Trigger Enforced)</th>
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
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                        Base Price: ₹{b.base_price}
                      </div>
                    </td>
                    <td>
                      <strong>{b.customer_name}</strong>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {b.address}
                    </td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td>
                      <div className={styles.statusForm}>
                        <select
                          className={styles.statusSelect}
                          value={selectedStatusMap[b.booking_id] || b.booking_status}
                          onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                          disabled={updatingId === b.booking_id || b.booking_status === 'Completed'}
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={styles.updateButton}
                          onClick={() => handleUpdateStatus(b.booking_id)}
                          disabled={
                            updatingId === b.booking_id ||
                            b.booking_status === 'Completed' ||
                            selectedStatusMap[b.booking_id] === b.booking_status
                          }
                        >
                          {updatingId === b.booking_id ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/partner/jobs/${b.booking_id}`}
                        style={{
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          fontSize: '12px',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
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

      <div className={styles.triggerBanner}>
        <strong>Trigger State Machine Notice:</strong> Status updates are validated by MySQL trigger{' '}
        <code>trg_booking_before_update</code>. Valid progression is{' '}
        <code>Assigned &rarr; En Route &rarr; Started &rarr; Completed</code>. Any out-of-order jump
        (such as jumping from <em>Assigned</em> directly to <em>Completed</em> or moving backward) will be
        rejected by the database with <code>SQLSTATE 45000</code>.
      </div>
    </div>
  );
}
