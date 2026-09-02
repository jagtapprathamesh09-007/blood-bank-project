const express = require('express');
const router = express.Router();
const { 
    checkEligibility, 
    bookDonationSlot, 
    getDonorAppointments,
    updateAppointmentStatus 
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/eligibility', protect, authorize('donor'), checkEligibility);
router.post('/book-slot', protect, authorize('donor'), bookDonationSlot);
router.get('/appointments', protect, getDonorAppointments);

// Blood Bank updates appointment status
router.put('/appointments/:id/status', protect, authorize('blood_bank'), updateAppointmentStatus);

module.exports = router;