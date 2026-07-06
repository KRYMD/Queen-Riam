// Test script to invoke the pairing generator
require('./lib/config'); // initialize global.PAIRING_NUMBER
const compat = require('./lib/sessionManagerCompat');

const num = (global.PAIRING_NUMBER && String(global.PAIRING_NUMBER).replace(/\D/g, '')) || (process.env.PAIRING_NUMBER || '255628294159').replace(/\D/g, '');

(async () => {
  console.log('[test_pair] Using number:', num);
  try {
    const code = await compat.generatePairingCode(num);
    console.log('[test_pair] Pairing code:', code);
  } catch (err) {
    console.error('[test_pair] Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
