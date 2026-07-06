const path = require('path');

// Compatibility layer for the obfuscated `lib/sessionManager.js`.
// Tries multiple shapes: default function, object with named exports, factory function returning an object.
const orig = require('./sessionManager');

let resolved = null;

async function resolveExports() {
  if (resolved) return resolved;

  let candidate = orig;

  // If it's a function, try calling it (some builds export a factory)
  if (typeof candidate === 'function') {
    try {
      const maybe = await Promise.resolve(candidate());
      if (maybe && typeof maybe === 'object') candidate = maybe;
    } catch (_) {
      // ignore errors from invoking unknown factory
    }
  }

  // If it has a default export, prefer that
  if (candidate && candidate.default && typeof candidate.default === 'object') {
    candidate = candidate.default;
  }

  // Look for likely function names
  const fnNames = ['generatePairingCode', 'generate', 'createPairingCode', 'pair', 'pairing'];
  for (const n of fnNames) {
    if (candidate && typeof candidate[n] === 'function') {
      resolved = { fn: candidate[n].bind(candidate) };
      return resolved;
    }
  }

  // If the module itself is a function that accepts (number) and returns a code, use it
  if (typeof orig === 'function') {
    resolved = { fn: orig };
    return resolved;
  }

  // Nothing found
  resolved = { fn: null };
  return resolved;
}

async function generatePairingCode(number) {
  const r = await resolveExports();
  if (!r.fn) throw new Error('Pairing function not found in sessionManager');
  return await Promise.resolve(r.fn(number));
}

module.exports = { generatePairingCode, resolveExports };
