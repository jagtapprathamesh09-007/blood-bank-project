const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    bloodBank: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    bloodGroup: { 
        type: String, 
        required: true, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    componentType: {
        type: String,
        required: true,
        enum: ['Whole Blood', 'PRBC', 'Platelets', 'FFP', 'Cryoprecipitate'],
        default: 'Whole Blood'
    },
    unitsAvailable: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Ensure unique bloodGroup + componentType combination per blood bank
inventorySchema.index({ bloodBank: 1, bloodGroup: 1, componentType: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);