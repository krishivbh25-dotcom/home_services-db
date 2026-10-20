const db = require('../config/db');

/**
 * GET /bookings
 * Retrieve all bookings, optionally filtered by customerId, partnerId, or status
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { customerId, partnerId, status } = req.query;
    let query = `
      SELECT 
        b.booking_id,
        b.customer_id,
        c.name AS customer_name,
        b.service_id,
        s.service_name,
        s.base_price,
        b.address_id,
        CONCAT(a.address_line, ', ', a.city, ' - ', a.pincode) AS address,
        b.partner_id,
        sp.name AS partner_name,
        b.scheduled_on,
        b.booking_status
      FROM Booking b
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      JOIN Address a ON b.address_id = a.address_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
    `;
    const params = [];
    const conditions = [];

    if (customerId) {
      conditions.push('b.customer_id = ?');
      params.push(customerId);
    }
    if (partnerId) {
      conditions.push('b.partner_id = ?');
      params.push(partnerId);
    }
    if (status) {
      conditions.push('b.booking_status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.booking_id DESC';

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bookings/:id
 * Retrieve a single booking by booking_id
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        b.booking_id,
        b.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        b.service_id,
        s.service_name,
        s.base_price,
        s.duration_min,
        b.address_id,
        a.address_line,
        a.city,
        a.pincode,
        b.partner_id,
        sp.name AS partner_name,
        sp.phone AS partner_phone,
        b.scheduled_on,
        b.booking_status
      FROM Booking b
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      JOIN Address a ON b.address_id = a.address_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
      WHERE b.booking_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /bookings
 * Executes CALL create_booking(?,?,?,?) and returns the created booking
 */
const createBooking = async (req, res, next) => {
  try {
    const customerId = req.body.customerId ?? req.body.customer_id;
    const serviceId = req.body.serviceId ?? req.body.service_id;
    const addressId = req.body.addressId ?? req.body.address_id;
    const scheduledOn = req.body.scheduledOn ?? req.body.scheduled_on;

    if (!customerId || !serviceId || !addressId || !scheduledOn) {
      return res.status(400).json({
        error: 'customerId, serviceId, addressId, and scheduledOn are required.'
      });
    }

    // Call stored procedure create_booking
    const [callResult] = await db.query(
      'CALL create_booking(?, ?, ?, ?)',
      [customerId, serviceId, addressId, scheduledOn]
    );

    const bookingId = callResult[0]?.[0]?.booking_id;

    if (!bookingId) {
      return res.status(500).json({ error: 'Failed to retrieve created booking id.' });
    }

    const [rows] = await db.query(
      `SELECT 
        b.booking_id,
        b.customer_id,
        c.name AS customer_name,
        b.service_id,
        s.service_name,
        s.base_price,
        b.address_id,
        CONCAT(a.address_line, ', ', a.city, ' - ', a.pincode) AS address,
        b.partner_id,
        sp.name AS partner_name,
        b.scheduled_on,
        b.booking_status
      FROM Booking b
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      JOIN Address a ON b.address_id = a.address_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
      WHERE b.booking_id = ?`,
      [bookingId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /bookings/:id/status
 * Updates booking_status. Trigger trg_booking_before_update enforces transition rules.
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.booking_status || req.body.status;

    if (!newStatus) {
      return res.status(400).json({ error: 'booking_status is required.' });
    }

    const [existing] = await db.query(
      'SELECT booking_id FROM Booking WHERE booking_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.query(
      'UPDATE Booking SET booking_status = ? WHERE booking_id = ?',
      [newStatus, id]
    );

    const [rows] = await db.query(
      `SELECT 
        b.booking_id,
        b.customer_id,
        c.name AS customer_name,
        b.service_id,
        s.service_name,
        b.address_id,
        b.partner_id,
        sp.name AS partner_name,
        b.scheduled_on,
        b.booking_status
      FROM Booking b
      JOIN Customer c ON b.customer_id = c.customer_id
      JOIN Service s ON b.service_id = s.service_id
      LEFT JOIN Service_Partner sp ON b.partner_id = sp.partner_id
      WHERE b.booking_id = ?`,
      [id]
    );

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bookings/statuses
 * Dynamically queries MySQL schema for allowed Job_Tracking / Booking status enum values
 */
const getBookingStatuses = async (req, res, next) => {
  try {
    const [colInfo] = await db.query(
      `SELECT COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'Job_Tracking' AND COLUMN_NAME = 'status' 
       LIMIT 1`
    );

    let statuses = ['Assigned', 'En Route', 'Started', 'Completed'];
    if (colInfo.length > 0 && colInfo[0].COLUMN_TYPE) {
      const match = colInfo[0].COLUMN_TYPE.match(/^enum\((.*)\)$/i);
      if (match) {
        statuses = match[1].split(',').map((s) => s.trim().replace(/^'(.*)'$/, '$1'));
      }
    }

    res.status(200).json(statuses);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bookings/:id/tracking
 * Retrieve Job_Tracking timeline history from database for a specific booking
 */
const getBookingTracking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify booking exists and retrieve current status
    const [bookingRows] = await db.query(
      'SELECT booking_id, booking_status FROM Booking WHERE booking_id = ?',
      [id]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Retrieve allowed statuses dynamically from Job_Tracking enum definition
    const [colInfo] = await db.query(
      `SELECT COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'Job_Tracking' AND COLUMN_NAME = 'status' 
       LIMIT 1`
    );

    let statuses = ['Assigned', 'En Route', 'Started', 'Completed'];
    if (colInfo.length > 0 && colInfo[0].COLUMN_TYPE) {
      const match = colInfo[0].COLUMN_TYPE.match(/^enum\((.*)\)$/i);
      if (match) {
        statuses = match[1].split(',').map((s) => s.trim().replace(/^'(.*)'$/, '$1'));
      }
    }

    // Retrieve tracking history ordered chronologically
    const [trackingRows] = await db.query(
      `SELECT 
        tracking_id,
        booking_id,
        status,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM Job_Tracking
      WHERE booking_id = ?
      ORDER BY tracking_id ASC`,
      [id]
    );

    res.status(200).json({
      booking_id: Number(id),
      current_status: bookingRows[0].booking_status,
      statuses,
      history: trackingRows
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  getBookingStatuses,
  getBookingTracking
};
