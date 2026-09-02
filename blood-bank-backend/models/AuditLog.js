const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { type: String, required: true }, // e.g., 'BATCH_ADDED', 'EMERGENCY_REQUESTED', 'STOCK_DISPATCHED'
    details: { type: String, required: true },
    ipAddress: { type: String },
    severity: { 
        type: String, 
        enum: ['INFO', 'WARNING', 'CRITICAL'], 
        default: 'INFO' 
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);