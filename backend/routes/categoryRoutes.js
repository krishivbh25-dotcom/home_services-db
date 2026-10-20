const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /categories
router.get('/', serviceController.getAllCategories);

// GET /categories/:id/services
router.get('/:id/services', serviceController.getServicesByCategoryId);

module.exports = router;
