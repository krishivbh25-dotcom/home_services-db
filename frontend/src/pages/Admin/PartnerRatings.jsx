import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import useSortableData from '../../hooks/useSortableData';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PartnerRatings.module.css';

export default function PartnerRatings() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getPartnerRatings()
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
      item.partner_name?.toLowerCase().includes(term) ||
      item.category_name?.toLowerCase().includes(term)
    );
  });

  const { items: sortedData, requestSort, getSortIndicator } = useSortableData(
    filteredData,
    'avg_score',
    'desc'
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Partner Rating &amp; Performance Summary</h1>
          <p>
            Aggregated analytical metrics calculating total reviews, average scores, and completed jobs per partner.
          </p>
        </div>
        <div className={styles.viewBadge}>SQL VIEW: partner_ratings</div>
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
            Showing {sortedData.length} of {data.length} partners &bull; Click any header to sort
          </span>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Calculating partner metrics from SQL view partner_ratings..." />
          ) : sortedData.length === 0 ? (
            <EmptyState
              title="No Ratings Found"
              description="No partner ratings match your filter query."
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
                  <th onClick={() => requestSort('category_name')}>
                    Domain Category <span className={styles.sortIcon}>{getSortIndicator('category_name')}</span>
                  </th>
                  <th onClick={() => requestSort('total_ratings')}>
                    Total Reviews <span className={styles.sortIcon}>{getSortIndicator('total_ratings')}</span>
                  </th>
                  <th onClick={() => requestSort('avg_score')}>
                    Average Rating <span className={styles.sortIcon}>{getSortIndicator('avg_score')}</span>
                  </th>
                  <th onClick={() => requestSort('completed_bookings')}>
                    Completed Jobs <span className={styles.sortIcon}>{getSortIndicator('completed_bookings')}</span>
                  </th>
                  <th>Quality Status</th>
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
                    <td>{row.category_name}</td>
                    <td>
                      <span className="mono">{row.total_ratings}</span>
                    </td>
                    <td>
                      {row.avg_score !== null ? (
                        <span className={styles.scoreBadge}>
                          ★ {Number(row.avg_score).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>Unrated</span>
                      )}
                    </td>
                    <td>
                      <strong className="mono">{row.completed_bookings}</strong>
                    </td>
                    <td>
                      {row.avg_score >= 4.5 ? (
                        <span style={{ color: 'var(--badge-success-text)', fontSize: '12px', fontWeight: 600 }}>
                          Top Rated
                        </span>
                      ) : row.avg_score >= 4.0 ? (
                        <span style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600 }}>
                          Good Standing
                        </span>
                      ) : row.total_ratings === 0 ? (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>New Partner</span>
                      ) : (
                        <span style={{ color: 'var(--color-accent)', fontSize: '12px', fontWeight: 600 }}>
                          Standard
                        </span>
                      )}
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
