const mongoose = require('mongoose');

const donorAppointmentSchema = new mongoose.Schema({
    donor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    bloodBank: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., '10:00 AM - 11:00 AM'
    status: { 
        type: String, 
        enum: ['Scheduled', 'Completed', 'Cancelled'], 
        default: 'Scheduled' 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DonorAppointment', donorAppointmentSchema);