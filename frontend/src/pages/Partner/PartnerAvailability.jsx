import React, { useEffect, useState } from 'react';
import { partnerService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PartnerAvailability.module.css';

const DAYS_MAP = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export default function PartnerAvailability() {
  const { activePartnerId } = useRole();
  const [availability, setAvailability] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activePartnerId) return;
    setLoading(true);
    Promise.all([
      partnerService.getPartnerById(activePartnerId),
      partnerService.getPartnerAvailability(activePartnerId),
    ])
      .then(([partData, availData]) => {
        setPartner(partData);
        setAvailability(availData);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activePartnerId]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Partner Weekly Availability</h1>
          <p>
            Recurring availability schedule for <strong>{partner?.name || 'Partner'}</strong>. Used by the
            booking stored procedure to match open partner slots.
          </p>
        </div>
      </div>

      <Alert message={error} type="error" />

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Retrieving weekly schedule slots from MySQL..." />
          ) : availability.length === 0 ? (
            <EmptyState
              title="No Availability Registered"
              description="No working time slots configured for this technician in table Partner_Availability."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Slot ID</th>
                  <th>Day of Week</th>
                  <th>Working Window</th>
                  <th>Total Duration</th>
                  <th>System Status</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((slot) => {
                  const dayName = DAYS_MAP[slot.day_of_week] || `Day ${slot.day_of_week}`;
                  return (
                    <tr key={slot.availability_id}>
                      <td>
                        <code className="mono">#{slot.availability_id}</code>
                      </td>
                      <td>
                        <span className={styles.dayBadge}>{dayName}</span>
                      </td>
                      <td>
                        <span className={styles.timeSlot}>
                          {slot.start_time} &mdash; {slot.end_time}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        Available for dispatch
                      </td>
                      <td>
                        <span style={{ color: 'var(--badge-success-text)', fontSize: '12px', fontWeight: 600 }}>
                          ● Active Slot
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={styles.infoNote}>
        <strong>Stored Procedure Requirement:</strong> During booking placement via{' '}
        <code>CALL create_booking()</code>, MySQL evaluates the day of the week and requested time window against{' '}
        <code>Partner_Availability</code>. If a partner is not scheduled during the appointment hours, they are excluded from assignment.
      </div>
    </div>
  );
}
