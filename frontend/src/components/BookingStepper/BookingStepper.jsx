import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from '../../services/bookingService';
import styles from './BookingStepper.module.css';

/**
 * Reusable Booking Status Stepper Component
 * Reads live audit history and schema enum statuses dynamically from Job_Tracking API.
 * 
 * - Completed steps: Green
 * - Current step: Blue
 * - Future steps: Grey
 * - Displays down arrows (↓) between steps
 * - Displays timestamps beside completed steps
 * - Does NOT hardcode statuses; uses backend Job_Tracking API
 */
export default function BookingStepper({ bookingId, currentStatus: propCurrentStatus, refreshTrigger }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookingTracking(bookingId);
      setTrackingData(data);
    } catch (err) {
      setError(err.message || 'Failed to load tracking timeline');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking, refreshTrigger]);

  if (loading && !trackingData) {
    return (
      <div className={styles.stepperContainer}>
        <div className={styles.loadingState}>
          Loading Job_Tracking audit history for booking #{bookingId}...
        </div>
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className={styles.stepperContainer}>
        <div className={styles.errorState}>
          <strong>Tracking Error:</strong> {error}
        </div>
      </div>
    );
  }

  // Extract dynamic statuses from API; fallback to empty array (never hardcoded in JSX)
  const statuses = trackingData?.statuses || [];
  const currentStatus = trackingData?.current_status || propCurrentStatus;
  const historyList = trackingData?.history || [];

  // Build a timestamp lookup map from Job_Tracking table rows
  const historyMap = {};
  historyList.forEach((entry) => {
    if (entry.status && entry.updated_at) {
      historyMap[entry.status] = entry.updated_at;
    }
  });

  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepperHeader}>
        <div className={styles.stepperTitle}>
          <span>Service Lifecycle Stepper</span>
          <span className={styles.tableTag}>Job_Tracking</span>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={fetchTracking}
          title="Refresh tracking history"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      <ul className={styles.stepList}>
        {statuses.map((status, index) => {
          const isCompleted = currentStatus === 'Completed' ? true : (currentIndex > -1 && index < currentIndex);
          const isCurrent = currentStatus === 'Completed' ? false : (index === currentIndex);
          const isFuture = currentStatus === 'Completed' ? false : (currentIndex > -1 ? index > currentIndex : false);

          const stepTimestamp = historyMap[status];

          let rowClass = styles.stepFuture;
          let statusLabel = 'Pending';
          let indicatorIcon = index + 1;

          if (isCompleted) {
            rowClass = styles.stepCompleted;
            statusLabel = 'Completed';
            indicatorIcon = '✓';
          } else if (isCurrent) {
            rowClass = styles.stepCurrent;
            statusLabel = 'In Progress';
            indicatorIcon = '●';
          }

          const hasNext = index < statuses.length - 1;
          const arrowClass = isCompleted
            ? styles.arrowCompleted
            : isCurrent
            ? styles.arrowCurrent
            : styles.arrowFuture;

          return (
            <li key={status} className={styles.stepItemWrapper}>
              <div className={`${styles.stepRow} ${rowClass}`}>
                <div className={styles.stepLeft}>
                  <div className={styles.stepIndicator}>{indicatorIcon}</div>
                  <div className={styles.stepName}>{status}</div>
                </div>

                <div className={styles.stepRight}>
                  {/* Display timestamps beside completed steps */}
                  {stepTimestamp ? (
                    <span className={styles.timestamp} title="Audited in Job_Tracking">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {stepTimestamp}
                    </span>
                  ) : (
                    <span className={styles.timestamp}>—</span>
                  )}
                  <span className={styles.statusTag}>{statusLabel}</span>
                </div>
              </div>

              {/* Down Arrow between steps */}
              {hasNext && (
                <div className={styles.connectorWrapper}>
                  <span className={`${styles.downArrow} ${arrowClass}`}>&darr;</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
