const fs = require('fs');
const path = require('path');

// Try to determine a safe pairing number source and normalize it.
try {
    const settings = require('../settings');
    const ownerFile = path.join(__dirname, '../data/owner.json');
    let ownerList = [];
    try {
        if (fs.existsSync(ownerFile)) ownerList = JSON.parse(fs.readFileSync(ownerFile, 'utf8')) || [];
    } catch (_) { ownerList = []; }

    // Normalize helper: extract digits only
    const normalize = s => String(s || '').replace(/[^0-9]/g, '');

    // Candidate sources in order: env.PAIRING_NUMBER, settings.ownerNumber, first entry in owner.json
    const envPair = normalize(process.env.PAIRING_NUMBER || '');
    const settingsPair = normalize(settings && settings.ownerNumber ? settings.ownerNumber : '');
    const ownerJsonPair = ownerList.length > 0 ? normalize(ownerList[0]) : '';

    let chosen = '';
    if (envPair && envPair.length >= 7 && envPair.length <= 15) chosen = envPair;
    else if (settingsPair && settingsPair.length >= 7 && settingsPair.length <= 15) chosen = settingsPair;
    else if (ownerJsonPair && ownerJsonPair.length >= 7 && ownerJsonPair.length <= 15) chosen = ownerJsonPair;

    // If chosen is empty, ensure we do NOT auto-pair: set global.PAIRING_NUMBER to empty string and log a clear warning.
    if (!chosen) {
        global.PAIRING_NUMBER = '';
        console.warn('\n[PAIRING] No valid PAIRING_NUMBER detected. To enable pairing, set the environment variable PAIRING_NUMBER or add a valid number in settings.ownerNumber or data/owner.json.');
    } else {
        global.PAIRING_NUMBER = chosen;
        console.log(`\n[PAIRING] Using pairing number: +${global.PAIRING_NUMBER}`);
        // Override runtime settings ownerNumber to avoid concatenated invalid values
        try {
            if (settings && typeof settings === 'object') {
                settings.ownerNumber = '+' + chosen;
            }
        } catch (_) {}
    }
} catch (err) {
    console.warn('[PAIRING] Warning while initializing pairing number: ', err && err.message ? err.message : err);
}

const configPath = path.join(__dirname, '../data/config.json');

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        console.error("❌ Failed to load config.json", err);
        return {};
    }
}

function saveConfig(newConfig) {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
}

module.exports = { loadConfig, saveConfig };