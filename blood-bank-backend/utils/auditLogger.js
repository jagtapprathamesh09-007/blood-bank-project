const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, details, ipAddress = '127.0.0.1', severity = 'INFO') => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            details,
            ipAddress,
            severity
        });
    } catch (error) {
        console.error('❌ Audit Logging Failed:', error.message);
    }
};

module.exports = logAudit;