import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import useSortableData from '../../hooks/useSortableData';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import BookingStepper from '../../components/BookingStepper';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './BookingDetailsView.module.css';

export default function BookingDetailsView() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStepperBooking, setActiveStepperBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getBookingDetails()
      .then((rows) => {
        setData(rows);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.customer_name?.toLowerCase().includes(term) ||
      item.partner_name?.toLowerCase().includes(term) ||
      item.service_name?.toLowerCase().includes(term) ||
      item.category_name?.toLowerCase().includes(term) ||
      item.booking_status?.toLowerCase().includes(term) ||
      String(item.booking_id).includes(term)
    );
  });

  const { items: sortedData, requestSort, getSortIndicator } = useSortableData(
    filteredData,
    'booking_id',
    'desc'
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Consolidated Booking Details</h1>
          <p>
            Master audit view joining bookings with customer contacts, service rates, technician allocation, and customer reviews.
          </p>
        </div>
        <div className={styles.viewBadge}>SQL VIEW: booking_details</div>
      </div>

      <Alert message={error} type="error" />

      <div className={styles.card}>
        <div className={styles.cardToolbar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search booking, customer, partner, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.rowCount}>
            Showing {sortedData.length} of {data.length} bookings &bull; Click any header to sort
          </span>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Querying consolidated SQL view booking_details..." />
          ) : sortedData.length === 0 ? (
            <EmptyState
              title="No Bookings Found"
              description="No booking records match your search filter."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => requestSort('booking_id')}>
                    ID <span className={styles.sortIcon}>{getSortIndicator('booking_id')}</span>
                  </th>
                  <th onClick={() => requestSort('customer_name')}>
                    Customer <span className={styles.sortIcon}>{getSortIndicator('customer_name')}</span>
                  </th>
                  <th onClick={() => requestSort('service_name')}>
                    Service <span className={styles.sortIcon}>{getSortIndicator('service_name')}</span>
                  </th>
                  <th onClick={() => requestSort('base_price')}>
                    Price <span className={styles.sortIcon}>{getSortIndicator('base_price')}</span>
                  </th>
                  <th onClick={() => requestSort('partner_name')}>
                    Assigned Partner <span className={styles.sortIcon}>{getSortIndicator('partner_name')}</span>
                  </th>
                  <th onClick={() => requestSort('scheduled_on')}>
                    Scheduled Date <span className={styles.sortIcon}>{getSortIndicator('scheduled_on')}</span>
                  </th>
                  <th onClick={() => requestSort('booking_status')}>
                    Status <span className={styles.sortIcon}>{getSortIndicator('booking_status')}</span>
                  </th>
                  <th>Service Address</th>
                  <th onClick={() => requestSort('rating_score')}>
                    Rating <span className={styles.sortIcon}>{getSortIndicator('rating_score')}</span>
                  </th>
                  <th>Job Tracking</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row) => (
                  <tr key={row.booking_id}>
                    <td>
                      <code className="mono">#{row.booking_id}</code>
                    </td>
                    <td>
                      <strong>{row.customer_name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{row.customer_phone}</div>
                    </td>
                    <td>
                      <div>{row.service_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{row.category_name}</div>
                    </td>
                    <td>
                      <span className="mono">₹{row.base_price}</span>
                    </td>
                    <td>
                      {row.partner_name ? (
                        <>
                          <strong>{row.partner_name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{row.partner_phone}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px' }}>{row.scheduled_on}</td>
                    <td>
                      <Badge status={row.booking_status} />
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {row.service_address}
                    </td>
                    <td>
                      {row.rating_score ? (
                        <div>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                            ★ {row.rating_score}
                          </span>
                          {row.review_text && (
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                maxWidth: '140px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={row.review_text}
                            >
                              "{row.review_text}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.stepperBtn}
                        onClick={() => setActiveStepperBooking(row)}
                      >
                        View Stepper &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Admin Job Tracking Stepper Modal */}
      {activeStepperBooking && (
        <div className={styles.modalOverlay} onClick={() => setActiveStepperBooking(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span>Booking #{activeStepperBooking.booking_id} Audit History</span>
                <Badge status={activeStepperBooking.booking_status} />
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setActiveStepperBooking(null)}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Customer: <strong>{activeStepperBooking.customer_name}</strong> &bull; Partner: <strong>{activeStepperBooking.partner_name || 'Unassigned'}</strong> &bull; Service: <strong>{activeStepperBooking.service_name}</strong>
            </div>

            <BookingStepper
              bookingId={activeStepperBooking.booking_id}
              currentStatus={activeStepperBooking.booking_status}
            />
          </div>
        </div>
      )}
    </div>
  );
}
