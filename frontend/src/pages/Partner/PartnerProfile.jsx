import React, { useEffect, useState } from 'react';
import { partnerService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PartnerProfile.module.css';

export default function PartnerProfile() {
  const { activePartnerId } = useRole();
  const [partner, setPartner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activePartnerId) return;
    setLoading(true);
    Promise.all([
      partnerService.getPartnerById(activePartnerId),
      partnerService.getPartnerDocuments(activePartnerId),
    ])
      .then(([partData, docData]) => {
        setPartner(partData);
        setDocuments(docData);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activePartnerId]);

  if (loading) {
    return <LoadingSpinner message="Loading partner credentials & verification records..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Partner Profile &amp; KYC Verification</h1>
          <p>Technician credentials, verification status, and uploaded compliance documents.</p>
        </div>
      </div>

      <Alert message={error} type="error" />

      {partner && (
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div>
              <div className={styles.profileName}>{partner.name}</div>
              <div className={styles.profileSub}>
                Specialization: <strong>{partner.category_name}</strong> &bull; Partner ID #{partner.partner_id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge status={partner.verification_status} />
              <Badge status={partner.account_status} />
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Registered Phone</span>
              <span className={styles.detailValue}>{partner.phone}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Work Experience</span>
              <span className={styles.detailValue}>{partner.experience_yrs} years</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Verified By Administrator</span>
              <span className={styles.detailValue}>
                {partner.verified_by_name ? `${partner.verified_by_name} (Admin #${partner.verified_by})` : 'Pending Verification'}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Primary Service Domain</span>
              <span className={styles.detailValue}>{partner.category_name}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Verification Lifecycle</span>
              <span className={styles.detailValue}>
                {partner.verification_status === 'Verified' ? 'Approved & Ready for Bookings' : 'Awaiting Document Review'}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Account State</span>
              <span className={styles.detailValue}>
                {partner.account_status === 'Active' ? 'Active in Dispatch Pool' : 'Suspended / Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KYC Documents Section */}
      <div className={styles.docSection}>
        <div className={styles.docHeader}>
          <h2 className={styles.docTitle}>Uploaded KYC &amp; Trade Documents ({documents.length})</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Audited via MySQL view <code>pending_kyc</code>
          </span>
        </div>

        <div className={styles.tableWrapper}>
          {documents.length === 0 ? (
            <EmptyState
              title="No KYC Documents Uploaded"
              description="Technician has not yet submitted trade or identity compliance documents."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Document Type</th>
                  <th>File Reference</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.document_id}>
                    <td>
                      <code className="mono">#{d.document_id}</code>
                    </td>
                    <td>
                      <strong>{d.document_type}</strong>
                    </td>
                    <td>
                      <code className="mono" style={{ color: 'var(--color-primary)' }}>
                        {d.file_url}
                      </code>
                    </td>
                    <td>
                      <Badge status={d.approval_status} />
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
