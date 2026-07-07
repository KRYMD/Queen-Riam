function normalizePairingNumber(value) {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('+') ? `+${digits.slice(1)}` : `+${digits}`;
}

function parsePairingCode(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const match = trimmed.match(/[A-Za-z0-9]{3,8}(?:[-_][A-Za-z0-9]{3,8})+/);
    return match ? match[0] : trimmed;
  }
  if (Array.isArray(value)) {
    return parsePairingCode(value[0]);
  }
  if (typeof value === 'object') {
    const direct = value.pairingCode || value.code || value.pairing_code || value.result || value.value;
    if (direct) return parsePairingCode(direct);
  }
  return '';
}

module.exports = { normalizePairingNumber, parsePairingCode };
