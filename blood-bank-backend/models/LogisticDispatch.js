const mongoose = require('mongoose');

const logisticDispatchSchema = new mongoose.Schema({
    emergencyRequest: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EmergencyRequest', 
        required: true 
    },
    bloodBank: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    hospital: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    vehicleNumber: { type: String, default: 'MH-31-EMG-108' },
    status: { 
        type: String, 
        enum: ['Assigned', 'Dispatched', 'In-Transit', 'Delivered', 'Cancelled'], 
        default: 'Assigned' 
    },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [Longitude, Latitude]
    },
    estimatedTimeArrival: { type: String, default: '15 mins' }
}, { timestamps: true });

logisticDispatchSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('LogisticDispatch', logisticDispatchSchema);