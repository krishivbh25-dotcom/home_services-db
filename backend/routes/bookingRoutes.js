const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /bookings
router.get('/', bookingController.getAllBookings);

// GET /bookings/statuses
router.get('/statuses', bookingController.getBookingStatuses);

// GET /bookings/:id
router.get('/:id', bookingController.getBookingById);

// GET /bookings/:id/tracking
router.get('/:id/tracking', bookingController.getBookingTracking);

// POST /bookings
router.post('/', bookingController.createBooking);

// PATCH /bookings/:id/status
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
