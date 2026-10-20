const db = require('../config/db');

/**
 * GET /ratings
 * Fetch all ratings with booking, customer, and partner details
 */
const getAllRatings = async (req, res, next) => {
  try {
    const { partnerId } = req.query;
    let query = `
      SELECT 
        r.rating_id,
        r.booking_id,
        r.score,
        r.review_text,
        r.rated_on,
        b.customer_id,
        c.name AS customer_name,
        b.partner_id,
        sp.name AS partner_name,
        s.service_name
      FROM Rating r
      JOIN Booking b ON r.booking_id = b.booking_id
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
    `;
    const params = [];

    if (partnerId) {
      query += ' WHERE b.partner_id = ?';
      params.push(partnerId);
    }

    query += ' ORDER BY r.rating_id DESC';

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /ratings/:bookingId
 * Fetch rating for a specific booking
 */
const getRatingByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const [rows] = await db.query(
      `SELECT 
        r.rating_id,
        r.booking_id,
        r.score,
        r.review_text,
        r.rated_on,
        b.customer_id,
        c.name AS customer_name,
        b.partner_id,
        sp.name AS partner_name,
        s.service_name
      FROM Rating r
      JOIN Booking b ON r.booking_id = b.booking_id
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
      WHERE r.booking_id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found for this booking.' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ratings
 * Simply inserts the row into Rating.
 * The database trigger validates whether the booking is completed.
 */
const createRating = async (req, res, next) => {
  try {
    const bookingId = req.body.bookingId ?? req.body.booking_id;
    const score = req.body.score;
    const reviewText = req.body.reviewText ?? req.body.review_text ?? null;
    const ratedOn = req.body.ratedOn ?? req.body.rated_on ?? new Date().toISOString().slice(0, 10);

    if (!bookingId || score === undefined || score === null) {
      return res.status(400).json({ error: 'bookingId and score are required.' });
    }

    // Insert row directly into database
    const [result] = await db.query(
      'INSERT INTO Rating (booking_id, score, review_text, rated_on) VALUES (?, ?, ?, ?)',
      [bookingId, score, reviewText, ratedOn]
    );

    const [rows] = await db.query(
      'SELECT rating_id, booking_id, score, review_text, rated_on FROM Rating WHERE rating_id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRatings,
  getRatingByBookingId,
  createRating
};
