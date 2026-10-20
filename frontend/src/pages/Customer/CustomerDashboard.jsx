import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService, bookingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './CustomerDashboard.module.css';

export default function CustomerDashboard() {
  const { activeCustomerId, setActiveCustomerId } = useRole();
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers list for switching demo customer
  useEffect(() => {
    customerService.getAllCustomers()
      .then((data) => {
        setCustomers(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Fetch bookings for the active customer
  useEffect(() => {
    if (!activeCustomerId) return;
    setLoading(true);
    bookingService.getAllBookings({ customerId: activeCustomerId })
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
  }, [activeCustomerId]);

  const activeCustomer = customers.find((c) => c.customer_id === activeCustomerId);

  // Filter bookings
  const upcomingBookings = bookings.filter(
    (b) => b.booking_status === 'Assigned' || b.booking_status === 'En Route' || b.booking_status === 'Started'
  );

  const recentBookings = bookings.filter((b) => b.booking_status === 'Completed');

  // Compute statistics
  const totalBookings = bookings.length;
  const inProgressCount = upcomingBookings.length;
  const completedCount = recentBookings.length;
  const totalSpent = bookings.reduce(
    (sum, b) => (b.booking_status === 'Completed' ? sum + Number(b.base_price || 0) : sum),
    0
  );

  return (
    <div className={styles.container}>
      {/* Header and Customer Profile Switcher */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Customer Dashboard</h1>
          <p>
            Welcome, <strong>{activeCustomer?.name || 'Customer'}</strong> ({activeCustomer?.phone || ''})
          </p>
        </div>

        {/* Demo Customer Picker */}
        <div className={styles.customerPicker}>
          <label htmlFor="customerSelect" className={styles.pickerLabel}>
            Acting As:
          </label>
          <select
            id="customerSelect"
            className={styles.selectInput}
            value={activeCustomerId}
            onChange={(e) => setActiveCustomerId(Number(e.target.value))}
          >
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.name} (ID: {c.customer_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Alert message={error} type="error" />

      {/* Quick Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Bookings</span>
          <span className={styles.statValue}>{totalBookings}</span>
          <span className={styles.statSubtext}>Lifetime customer orders</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active / Upcoming</span>
          <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
            {inProgressCount}
          </span>
          <span className={styles.statSubtext}>Assigned, en route, started</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed Services</span>
          <span className={styles.statValue} style={{ color: 'var(--badge-success-text)' }}>
            {completedCount}
          </span>
          <span className={styles.statSubtext}>Eligible for rating</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Spent</span>
          <span className={styles.statValue}>₹{totalSpent.toFixed(2)}</span>
          <span className={styles.statSubtext}>Completed orders value</span>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming &amp; Active Bookings ({upcomingBookings.length})</h2>
          <Link to="/book" className={styles.actionButton}>
            + Book New Service
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Loading active bookings from MySQL..." />
          ) : upcomingBookings.length === 0 ? (
            <EmptyState
              title="No In-Progress Bookings"
              description="No active or ongoing service orders found for this customer profile."
              action={
                <Link to="/book" className="btn btn-primary btn-sm">
                  + Book a Service
                </Link>
              }
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Assigned Partner</th>
                  <th>Scheduled On</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td>
                      <code className="mono">#{b.booking_id}</code>
                    </td>
                    <td>
                      <strong>{b.service_name}</strong>
                    </td>
                    <td>{b.partner_name || <span style={{ color: 'var(--text-subtle)' }}>Auto-assigned</span>}</td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td className="mono">₹{b.base_price}</td>
                    <td>
                      <Link to={`/bookings/${b.booking_id}`} className={styles.primaryLink}>
                        View Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent / Completed Bookings Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Completed Services ({recentBookings.length})</h2>
          <Link to="/bookings" className={styles.actionButton}>
            View All Bookings &rarr;
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Loading service history..." />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              title="No Completed Services"
              description="Completed service records and ratings will appear here."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Partner</th>
                  <th>Scheduled On</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 5).map((b) => (
                  <tr key={b.booking_id}>
                    <td>
                      <code className="mono">#{b.booking_id}</code>
                    </td>
                    <td>{b.service_name}</td>
                    <td>{b.partner_name}</td>
                    <td>{b.scheduled_on}</td>
                    <td>
                      <Badge status={b.booking_status} />
                    </td>
                    <td className="mono">₹{b.base_price}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Link to={`/bookings/${b.booking_id}`} className={styles.primaryLink}>
                          Details
                        </Link>
                        <Link
                          to={`/ratings/new?bookingId=${b.booking_id}`}
                          style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Rate Service &rarr;
                        </Link>
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
