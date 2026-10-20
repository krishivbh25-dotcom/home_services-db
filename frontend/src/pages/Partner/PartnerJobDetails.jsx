import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService } from '../../services';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import BookingStepper from '../../components/BookingStepper';
import styles from './PartnerJobDetails.module.css';

const ALL_STATUSES = ['Assigned', 'En Route', 'Started', 'Completed'];

export default function PartnerJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchJob = () => {
    setLoading(true);
    bookingService.getBookingById(id)
      .then((data) => {
        setJob(data);
        setNewStatus(data.booking_status);
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
    fetchJob();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === job.booking_status) return;

    setError(null);
    setSuccess(null);
    setUpdating(true);

    try {
      const updated = await bookingService.updateBookingStatus(id, newStatus);
      const msg = `Booking #${id} status transitioned to "${updated.booking_status}" successfully.`;
      setSuccess(msg);
      toast.success(msg);
      fetchJob();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading partner job details...</div>;
  }

  if (error && !job) {
    return (
      <div className={styles.container}>
        <Alert message={error} type="error" />
        <Link to="/partner/jobs" className={styles.backLink}>
          &larr; Back to Assigned Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link to="/partner/jobs" className={styles.backLink}>
          &larr; Back to Assigned Jobs
        </Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Assigned Job #{job.booking_id}
        </span>
      </div>

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.jobTitleArea}>
              <h1 className={styles.jobTitle}>Job #{job.booking_id}</h1>
              <Badge status={job.booking_status} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Scheduled for: <strong>{job.scheduled_on}</strong>
            </div>
          </div>
        </div>

        {/* Reusable Booking Status Stepper */}
        <div className={styles.stepperSection}>
          <BookingStepper bookingId={job.booking_id} currentStatus={job.booking_status} refreshTrigger={job.booking_status} />
        </div>

        {/* Job Details Grid */}
        <div className={styles.gridTwo}>
          <div className={styles.infoBlock}>
            <div className={styles.infoBlockTitle}>Customer Information</div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Customer Name:</span>
                <span className={styles.infoValue}>{job.customer_name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone Contact:</span>
                <span className={styles.infoValue}>{job.customer_phone || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Service Address:</span>
                <span className={styles.infoValue}>
                  {job.address_line}, {job.city} - {job.pincode}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoBlock}>
            <div className={styles.infoBlockTitle}>Service &amp; Earnings</div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Service Name:</span>
                <span className={styles.infoValue}>{job.service_name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Base Price:</span>
                <span className={styles.infoValue}>₹{job.base_price}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Estimated Duration:</span>
                <span className={styles.infoValue}>{job.duration_min} minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Transition Action Card */}
        <div className={styles.actionCard}>
          <div className={styles.actionTitle}>Update Job Status</div>
          <div className={styles.actionDesc}>
            Advancing job status will automatically append a record to <code>Job_Tracking</code> and enforce transition rules via MySQL trigger <code>trg_booking_before_update</code>.
          </div>

          <form onSubmit={handleUpdateStatus} className={styles.statusForm}>
            <select
              className={styles.statusSelect}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={updating || job.booking_status === 'Completed'}
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status} {status === job.booking_status ? '(Current)' : ''}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className={styles.updateButton}
              disabled={updating || job.booking_status === 'Completed' || newStatus === job.booking_status}
            >
              {updating ? 'Updating...' : 'Advance Status'}
            </button>
          </form>

          <div className={styles.triggerNote}>
            <strong>Trigger Notice:</strong> Valid progression is Assigned &rarr; En Route &rarr; Started &rarr; Completed. Illegal transitions are rejected by MySQL.
          </div>
        </div>
      </div>
    </div>
  );
}
