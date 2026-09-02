const express = require('express');
const router = express.Router();
const { acceptAndDispatch, updateDispatchStatus, getDispatches } = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/accept')
    .post(protect, authorize('blood_bank', 'admin'), acceptAndDispatch);

router.route('/:id/status')
    .put(protect, updateDispatchStatus);

router.route('/')
    .get(protect, getDispatches);

module.exports = router;