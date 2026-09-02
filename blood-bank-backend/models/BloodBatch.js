const mongoose = require('mongoose');

const bloodBatchSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true, unique: true },
    bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: { 
        type: String, 
        required: true, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    componentType: {
        type: String,
        required: true,
        enum: ['Whole Blood', 'PRBC', 'Platelets', 'FFP', 'Cryoprecipitate']
    },
    quantityUnits: { type: Number, required: true },
    collectionDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    storageTemperature: { type: Number }, // Celsius
    isColdChainSafe: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Dispatched', 'Expired', 'Discarded'],
        default: 'Available'
    }
}, { timestamps: true });

module.exports = mongoose.model('BloodBatch', bloodBatchSchema);