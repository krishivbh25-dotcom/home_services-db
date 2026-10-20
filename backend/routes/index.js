const express = require('express');
const router = express.Router();

const customerRoutes = require('./customerRoutes');
const categoryRoutes = require('./categoryRoutes');
const serviceRoutes = require('./serviceRoutes');
const partnerRoutes = require('./partnerRoutes');
const bookingRoutes = require('./bookingRoutes');
const ratingRoutes = require('./ratingRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/partners', partnerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);
router.use('/', adminRoutes);

module.exports = router;
