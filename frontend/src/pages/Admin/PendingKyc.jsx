import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import useSortableData from '../../hooks/useSortableData';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PendingKyc.module.css';

export default function PendingKyc() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getPendingKyc()
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

  // Filter based on search input
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.partner_name?.toLowerCase().includes(term) ||
      item.category_name?.toLowerCase().includes(term) ||
      item.phone?.includes(term)
    );
  });

  // Use sortable hook
  const { items: sortedData, requestSort, getSortIndicator } = useSortableData(
    filteredData,
    'partner_id',
    'asc'
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Pending KYC Approvals</h1>
          <p>Service partners with documents awaiting verification. Populated directly from the database view.</p>
        </div>
        <div className={styles.viewBadge}>SQL VIEW: pending_kyc</div>
      </div>

      <Alert message={error} type="error" />

      <div className={styles.card}>
        <div className={styles.cardToolbar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search partner or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.rowCount}>
            Showing {sortedData.length} of {data.length} records &bull; Click any header to sort
          </span>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Querying SQL view pending_kyc..." />
          ) : sortedData.length === 0 ? (
            <EmptyState
              title="No Pending KYC Verifications"
              description="All registered technician partners are verified or no records match your search filter."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => requestSort('partner_id')}>
                    Partner ID <span className={styles.sortIcon}>{getSortIndicator('partner_id')}</span>
                  </th>
                  <th onClick={() => requestSort('partner_name')}>
                    Partner Name <span className={styles.sortIcon}>{getSortIndicator('partner_name')}</span>
                  </th>
                  <th onClick={() => requestSort('phone')}>
                    Phone Number <span className={styles.sortIcon}>{getSortIndicator('phone')}</span>
                  </th>
                  <th onClick={() => requestSort('category_name')}>
                    Domain Category <span className={styles.sortIcon}>{getSortIndicator('category_name')}</span>
                  </th>
                  <th onClick={() => requestSort('doc_count')}>
                    Docs Submitted <span className={styles.sortIcon}>{getSortIndicator('doc_count')}</span>
                  </th>
                  <th>Document Types</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row) => (
                  <tr key={row.partner_id}>
                    <td>
                      <code className="mono">#{row.partner_id}</code>
                    </td>
                    <td>
                      <strong>{row.partner_name}</strong>
                    </td>
                    <td className="mono">{row.phone}</td>
                    <td>{row.category_name}</td>
                    <td>
                      <strong style={{ color: row.doc_count > 0 ? 'var(--color-primary)' : 'var(--badge-danger-text)' }}>
                        {row.doc_count}
                      </strong>
                    </td>
                    <td>
                      {row.doc_types ? (
                        row.doc_types.split(', ').map((doc, idx) => (
                          <span key={idx} className={styles.docTag}>
                            {doc}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>None Uploaded</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--badge-warning-text)',
                          backgroundColor: 'var(--badge-warning-bg)',
                          border: '1px solid var(--badge-warning-border)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        Pending KYC
                      </span>
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
