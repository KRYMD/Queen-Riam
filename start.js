// Lightweight startup shim to ensure the platform finds a stable entrypoint.
console.log('[start.js] Booting application...');
try {
  require('./index.js');
} catch (err) {
  console.error('[start.js] Failed to require ./index.js:', err && err.message ? err.message : err);
  process.exit(1);
}
