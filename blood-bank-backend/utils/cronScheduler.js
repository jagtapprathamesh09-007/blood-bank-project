const cron = require('node-cron');
const BloodBatch = require('../models/BloodBatch');

const initCronJobs = (io) => {
    // Har raat 12 baje (0 0 * * *) run hoga. Testing ke liye har 1 hour (0 * * * *) bhi rakh sakte hain.
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running Automated Expiry Check Cron Job...');

        try {
            const today = new Date();
            const fiveDaysFromNow = new Date();
            fiveDaysFromNow.setDate(today.getDate() + 5);

            // Find batches expiring in next 5 days that are currently 'Available'
            const expiringBatches = await BloodBatch.find({
                expiryDate: { $lte: fiveDaysFromNow, $gte: today },
                status: 'Available'
            }).populate('bloodBank', 'facilityName contactNumber');

            if (expiringBatches.length > 0) {
                console.log(`⚠️ Found ${expiringBatches.length} blood batches expiring soon!`);

                // Real-time notification to blood banks
                io.emit('EXPIRY_WARNING_ALERT', {
                    message: `${expiringBatches.length} blood units are expiring within 5 days. Consider dynamic re-allocation.`,
                    batches: expiringBatches
                });
            }

            // Auto-mark expired batches
            const expiredBatches = await BloodBatch.updateMany(
                { expiryDate: { $lt: today }, status: 'Available' },
                { $set: { status: 'Expired' } }
            );

            if (expiredBatches.modifiedCount > 0) {
                console.log(`🚨 Auto-marked ${expiredBatches.modifiedCount} batches as 'Expired'`);
            }

        } catch (error) {
            console.error('❌ Cron Job Error:', error.message);
        }
    });
};

module.exports = initCronJobs;