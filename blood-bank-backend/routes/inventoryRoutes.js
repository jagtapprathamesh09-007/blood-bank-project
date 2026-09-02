const express = require('express');
const router = express.Router();
const { addBloodBatch, getInventory, getBatches } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getInventory);

router.route('/batch')
    .post(protect, authorize('blood_bank', 'admin'), addBloodBatch);

router.route('/batches')
    .get(protect, authorize('blood_bank', 'admin'), getBatches);

module.exports = router;