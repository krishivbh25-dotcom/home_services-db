const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

// Specific view endpoints defined first to prevent collision with :id
router.get('/', partnerController.getAllPartners);
router.get('/pending-kyc', partnerController.getPendingKyc);
router.get('/ratings', partnerController.getPartnerRatings);
router.get('/:id', partnerController.getPartnerById);
router.get('/:id/availability', partnerController.getPartnerAvailability);
router.get('/:id/services', partnerController.getPartnerServices);
router.put('/:id/services/:serviceId', partnerController.updatePartnerService);
router.get('/:id/documents', partnerController.getPartnerDocuments);

module.exports = router;
