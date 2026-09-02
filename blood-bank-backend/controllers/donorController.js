const User = require('../models/User');
const DonorAppointment = require('../models/DonorAppointment');

// @desc    Check Donor Eligibility (90-day cooldown rule)
// @route   GET /api/donors/eligibility
// @access  Private (Donor)
const checkEligibility = async (req, res, next) => {
    try {
        const donor = await User.findById(req.user.id);

        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        if (!donor.lastDonationDate) {
            return res.json({
                isEligible: true,
                message: 'You are eligible to donate blood!'
            });
        }

        const lastDonation = new Date(donor.lastDonationDate);
        const nextEligibleDate = new Date(lastDonation);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

        const today = new Date();
        const isEligible = today >= nextEligibleDate;

        res.json({
            isEligible,
            lastDonationDate: donor.lastDonationDate,
            nextEligibleDate,
            message: isEligible 
                ? 'You are eligible to donate blood!' 
                : `Cooldown active. You can donate again after ${nextEligibleDate.toLocaleDateString()}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Book a donation slot
// @route   POST /api/donors/book-slot
// @access  Private (Donor)
const bookDonationSlot = async (req, res, next) => {
    try {
        const { bloodBankId, appointmentDate, timeSlot, notes } = req.body;

        const appointment = await DonorAppointment.create({
            donor: req.user.id,
            bloodBank: bloodBankId,
            appointmentDate,
            timeSlot,
            notes,
            status: 'Scheduled'
        });

        res.status(201).json({
            success: true,
            appointment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get donor appointments (For Donor or Blood Bank)
// @route   GET /api/donors/appointments
// @access  Private
const getDonorAppointments = async (req, res, next) => {
    try {
        let appointments;

        if (req.user.role === 'donor') {
            appointments = await DonorAppointment.find({ donor: req.user.id })
                .populate('bloodBank', 'name facilityName contactNumber location')
                .sort({ appointmentDate: -1 });
        } else if (req.user.role === 'blood_bank') {
            appointments = await DonorAppointment.find({ bloodBank: req.user.id })
                .populate('donor', 'name bloodGroup contactNumber email')
                .sort({ appointmentDate: -1 });
        } else {
            appointments = await DonorAppointment.find()
                .populate('donor', 'name bloodGroup')
                .populate('bloodBank', 'facilityName');
        }

        res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Appointment Status (Blood Bank side)
// @route   PUT /api/donors/appointments/:id/status
// @access  Private (Blood Bank)
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const appointment = await DonorAppointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        if (status === 'Completed') {
            await User.findByIdAndUpdate(appointment.donor, {
                lastDonationDate: appointment.appointmentDate
            });
        }

        res.json({ success: true, appointment });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkEligibility,
    bookDonationSlot,
    getDonorAppointments,
    updateAppointmentStatus
};