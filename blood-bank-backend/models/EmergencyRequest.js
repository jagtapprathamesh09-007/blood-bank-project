const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
    hospital: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    patientName: { type: String, required: true },
    requiredBloodGroup: { 
        type: String, 
        required: true, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    componentType: {
        type: String,
        required: true,
        enum: ['Whole Blood', 'PRBC', 'Platelets', 'FFP', 'Cryoprecipitate'],
        default: 'PRBC'
    },
    unitsRequired: { type: Number, required: true },
    urgencyLevel: { 
        type: String, 
        enum: ['Critical', 'High', 'Moderate'], 
        default: 'Critical' 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Dispatched', 'Fulfilled', 'Cancelled'], 
        default: 'Pending' 
    },
    assignedBloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [Longitude, Latitude]
    }
}, { timestamps: true });

emergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);