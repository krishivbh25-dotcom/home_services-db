import React from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no records matching your query or filter criteria in the database.',
  action = null,
  icon = null
}) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon || (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.actionArea}>{action}</div>}
    </div>
  );
}
