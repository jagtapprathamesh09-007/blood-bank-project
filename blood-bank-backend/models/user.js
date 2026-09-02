const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'blood_bank', 'hospital', 'donor', 'driver'], 
        default: 'hospital' 
    },
    facilityName: { type: String }, // Hospital or Blood Bank Name
    contactNumber: { type: String, required: true },
    bloodGroup: { 
        type: String, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'],
        default: 'N/A'
    }, // Useful for Donors
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [Longitude, Latitude] for Geo-Spatial Queries
    },
    isAvailable: { type: Boolean, default: true } // For Donors & Drivers
}, { timestamps: true });

// Geo-spatial Indexing (Proximity Search ke liye)
userSchema.index({ location: '2dsphere' });

// Hash Password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match Password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);