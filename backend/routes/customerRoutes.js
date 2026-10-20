const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /customers
router.get('/', customerController.getAllCustomers);

// GET /customers/:id
router.get('/:id', customerController.getCustomerById);

// GET /customers/:id/addresses
router.get('/:id/addresses', customerController.getCustomerAddresses);

// POST /customers
router.post('/', customerController.createCustomer);

// PUT /customers/:id
router.put('/:id', customerController.updateCustomer);

// DELETE /customers/:id
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
