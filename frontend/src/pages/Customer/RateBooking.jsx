import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService, ratingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Alert from '../../components/Alert/Alert';
import styles from './RateBooking.module.css';

export default function RateBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeCustomerId } = useRole();

  const queryBookingId = searchParams.get('bookingId') || '';

  const [bookingId, setBookingId] = useState(queryBookingId);
  const [score, setScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load customer's bookings so they can choose from dropdown if not in query
  useEffect(() => {
    if (!activeCustomerId) return;
    bookingService.getAllBookings({ customerId: activeCustomerId })
      .then((data) => {
        setBookings(data);
        if (!bookingId && data.length > 0) {
          const completed = data.find((b) => b.booking_status === 'Completed');
          setBookingId(completed ? completed.booking_id : data[0].booking_id);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [activeCustomerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await ratingService.createRating({
        bookingId: Number(bookingId),
        score: Number(score),
        reviewText: reviewText.trim() || null,
      });

      const successMsg = `Rating submitted successfully for booking #${bookingId}!`;
      setSuccess(successMsg);
      toast.success(successMsg);
      setTimeout(() => {
        navigate(`/bookings/${bookingId}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <h1>Rate a Service</h1>
        <p>Submit customer feedback and rating score (1-5) for a completed service.</p>
      </div>

      <div className={styles.card}>
        <Alert message={error} type="error" />
        <Alert message={success} type="success" />

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Booking Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="bookingSelect" className={styles.label}>
              Select Booking
            </label>
            <select
              id="bookingSelect"
              className={styles.select}
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              required
            >
              {bookings.map((b) => (
                <option key={b.booking_id} value={b.booking_id}>
                  #{b.booking_id} - {b.service_name} ({b.booking_status}) - {b.scheduled_on}
                </option>
              ))}
            </select>
          </div>

          {/* 5-Star Rating Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Score (1 to 5 Stars)</label>
            <div className={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starBtn} ${star <= score ? styles.starBtnActive : ''}`}
                  onClick={() => setScore(star)}
                >
                  ★
                </button>
              ))}
              <span className={styles.scoreLabel}>
                {score} / 5 {score === 5 ? '(Excellent)' : score === 4 ? '(Good)' : score === 3 ? '(Average)' : '(Poor)'}
              </span>
            </div>
          </div>

          {/* Review Textarea */}
          <div className={styles.formGroup}>
            <label htmlFor="reviewInput" className={styles.label}>
              Review / Feedback <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <textarea
              id="reviewInput"
              className={styles.textarea}
              placeholder="Describe your service experience, partner punctuality, and quality of work..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || !bookingId}>
            {loading ? 'Submitting to database...' : 'Submit Rating'}
          </button>
        </form>

        <div className={styles.triggerNote}>
          <strong>Database Trigger Notice:</strong> MySQL trigger <code>trg_rating_before_insert</code>{' '}
          strictly enforces that ratings can only be inserted for bookings in <code>Completed</code> status.
          Attempting to rate an active job raises <code>SQLSTATE 45000</code>.
        </div>
      </div>
    </div>
  );
}
