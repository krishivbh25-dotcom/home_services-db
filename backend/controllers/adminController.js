const db = require('../config/db');

/**
 * GET /booking-details
 * Directly queries the booking_details SQL view
 */
const getBookingDetails = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM booking_details');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /pending-kyc
 * Directly queries the pending_kyc SQL view
 */
const getPendingKyc = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM pending_kyc');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partner-ratings
 * Directly queries the partner_ratings SQL view
 */
const getPartnerRatings = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM partner_ratings');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBookingDetails,
  getPendingKyc,
  getPartnerRatings
};
