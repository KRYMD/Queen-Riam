require('dotenv').config();
// Global session and pairing configuration
// Put your session id in the environment variable SESSION_ID or set it here.
global.SESSION_ID = process.env.SESSION_ID || "" // put your session id here

// REQUIRED: Your WhatsApp number for pairing (e.g., "1234567890" without + or spaces)
// IMPORTANT: Bot will NOT start without a valid PAIRING_NUMBER for security reasons
global.PAIRING_NUMBER = process.env.PAIRING_NUMBER || "" // REQUIRED: Your WhatsApp number for pairing

module.exports = {
    WARN_COUNT: 3
};
