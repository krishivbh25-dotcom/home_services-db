const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Endpoints querying database views
router.get('/booking-details', adminController.getBookingDetails);
router.get('/pending-kyc', adminController.getPendingKyc);
router.get('/partner-ratings', adminController.getPartnerRatings);

module.exports = router;
