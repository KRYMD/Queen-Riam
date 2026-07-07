const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizePairingNumber, parsePairingCode } = require('../lib/pairing');

test('normalizePairingNumber adds a plus sign for digit-only input', () => {
  assert.equal(normalizePairingNumber('255628294159'), '+255628294159');
  assert.equal(normalizePairingNumber('+255628294159'), '+255628294159');
  assert.equal(normalizePairingNumber(''), '');
});

test('parsePairingCode extracts the code from common pairing responses', () => {
  assert.equal(parsePairingCode('ABCD-EFGH'), 'ABCD-EFGH');
  assert.equal(parsePairingCode({ pairingCode: 'ABCD-EFGH' }), 'ABCD-EFGH');
  assert.equal(parsePairingCode({ code: 'WXYZ-1234' }), 'WXYZ-1234');
});
