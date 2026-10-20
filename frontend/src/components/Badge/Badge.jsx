import React from 'react';
import styles from './Badge.module.css';

export default function Badge({ status, children }) {
  const text = children || status;
  let statusClass = styles.default;

  const normalized = String(status || '').toLowerCase().trim();

  if (normalized === 'assigned') {
    statusClass = styles.assigned;
  } else if (normalized === 'en route' || normalized === 'enroute' || normalized === 'pending') {
    statusClass = styles.enRoute;
  } else if (normalized === 'started') {
    statusClass = styles.started;
  } else if (normalized === 'completed' || normalized === 'verified' || normalized === 'active') {
    statusClass = styles.completed;
  } else if (normalized === 'cancelled' || normalized === 'rejected' || normalized === 'suspended') {
    statusClass = styles.cancelled;
  }

  return <span className={`${styles.badge} ${statusClass}`}>{text}</span>;
}
