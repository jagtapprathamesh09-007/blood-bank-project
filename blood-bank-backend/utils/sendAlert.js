// backend/utils/sendAlert.js
const twilio = require('twilio');

// Twilio credentials from process.env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

const sendCodeRedAlert = async ({ patientName, requiredBloodGroup, unitsRequired, urgencyLevel, hospitalName }) => {
    const alertMessage = `🚨 CODE RED BLOOD EMERGENCY 🚨\nFacility: ${hospitalName}\nPatient: ${patientName}\nGroup Required: ${requiredBloodGroup}\nUnits: ${unitsRequired}\nUrgency: ${urgencyLevel}\nPlease respond immediately if available!`;

    console.log("------------------------------------");
    console.log("📲 DISPATCHING EMERGENCY SMS ALERT:");
    console.log(alertMessage);
    console.log("------------------------------------");

    if (client && fromPhone) {
        try {
            // Send to registered emergency hotline / broadcast number
            await client.messages.create({
                body: alertMessage,
                from: fromPhone,
                to: process.env.EMERGENCY_BROADCAST_PHONE || fromPhone
            });
            console.log("✅ SMS Alert successfully sent via Twilio Gateway!");
        } catch (error) {
            console.error("❌ Twilio SMS Transmission Error:", error.message);
        }
    } else {
        console.log("⚠️ Twilio API credentials not configured. Executing simulated SMS dispatch in Console Mode.");
    }
};

module.exports = { sendCodeRedAlert };