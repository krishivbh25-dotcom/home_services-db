const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

// GET /ratings
router.get('/', ratingController.getAllRatings);

// GET /ratings/:bookingId
router.get('/:bookingId', ratingController.getRatingByBookingId);

// POST /ratings
router.post('/', ratingController.createRating);

module.exports = router;
