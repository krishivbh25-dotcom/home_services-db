import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService, ratingService } from '../../services';
import Badge from '../../components/Badge/Badge';
import Alert from '../../components/Alert/Alert';
import BookingStepper from '../../components/BookingStepper';
import styles from './BookingDetails.module.css';

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookingService.getBookingById(id)
      .then((data) => {
        setBooking(data);
        setError(null);
        // Also check if rating exists for this booking
        return ratingService.getRatingByBookingId(id).catch(() => null);
      })
      .then((ratingData) => {
        if (ratingData) {
          setRating(ratingData);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div className={styles.container}>
        <Alert message={error || 'Booking not found'} type="error" />
        <Link to="/bookings" className={styles.backLink}>
          &larr; Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <div className={styles.topBar}>
        <Link to="/bookings" className={styles.backLink}>
          &larr; Back to My Bookings
        </Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Database Table: <code>Booking</code> &bull; ID: #{booking.booking_id}
        </span>
      </div>

      <div className={styles.mainCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.bookingIdTitle}>
            <span>Booking #{booking.booking_id}</span>
            <Badge status={booking.booking_status} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Scheduled: <strong>{booking.scheduled_on}</strong>
          </div>
        </div>

        {/* Milestone Lifecycle Stepper (Job_Tracking API) */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <BookingStepper bookingId={booking.booking_id} currentStatus={booking.booking_status} />
        </div>

        {/* Information Grid */}
        <div className={styles.detailsGrid}>
          {/* Service Details */}
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Service Information</span>
            <span className={styles.detailValue}>
              <strong>{booking.service_name}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Base Price: ₹{booking.base_price} &bull; Duration: {booking.duration_min} mins
            </span>
          </div>

          {/* Assigned Partner */}
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Assigned Service Partner</span>
            <span className={styles.detailValue}>
              <strong>{booking.partner_name || 'Partner Not Assigned'}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Phone: {booking.partner_phone || 'N/A'}
            </span>
          </div>

          {/* Customer Information */}
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Customer Details</span>
            <span className={styles.detailValue}>
              <strong>{booking.customer_name}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Contact: {booking.customer_phone}
            </span>
          </div>

          {/* Service Address */}
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Service Address</span>
            <span className={styles.detailValue}>
              {booking.address_line}, {booking.city} - {booking.pincode}
            </span>
          </div>
        </div>

        {/* Rating Section */}
        {booking.booking_status === 'Completed' && (
          <div className={styles.ratingSection}>
            {rating ? (
              <div>
                <span className={styles.detailLabel}>Submitted Customer Review</span>
                <div className={styles.starsRow} style={{ marginTop: '4px' }}>
                  {'★'.repeat(rating.score)}
                  {'☆'.repeat(5 - rating.score)}
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginLeft: '6px' }}>
                    {rating.score} / 5
                  </span>
                </div>
                {rating.review_text && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{rating.review_text}"
                  </p>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px', display: 'block' }}>
                  Rated on: {rating.rated_on}
                </span>
              </div>
            ) : (
              <>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Service is Marked Completed
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Share your feedback to help us maintain verified partner service quality.
                  </p>
                </div>
                <Link to={`/ratings/new?bookingId=${booking.booking_id}`} className={styles.rateNowBtn}>
                  ★ Rate Service
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
