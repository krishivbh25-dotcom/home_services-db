const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /services (supports ?categoryId=)
router.get('/', serviceController.getAllServices);

// GET /services/:id
router.get('/:id', serviceController.getServiceById);

module.exports = router;
