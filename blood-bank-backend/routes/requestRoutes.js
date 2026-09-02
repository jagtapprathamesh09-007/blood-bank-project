const express = require('express');
const router = express.Router();
const { 
    createPatientRequest,
    createEmergencyRequest, 
    getEmergencyRequests, 
    updateRequestStatus 
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Direct Patient Public Submission (Fixes the 404 error on /track)
router.post('/', createPatientRequest);

// 2. Public Radar / Tracking Search
router.get('/', getEmergencyRequests);

// 3. Hospital Official Code-Red Broadcast
router.post('/emergency', protect, authorize('hospital'), createEmergencyRequest);

// 4. Multi-role Status Update
router.put('/:id/status', protect, authorize('hospital', 'blood_bank', 'driver'), updateRequestStatus);

module.exports = router;