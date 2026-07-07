const { getLang } = require('../lib/lang');
// Use a compatibility wrapper around the obfuscated session manager.
const _sessionManager = require('../lib/sessionManagerCompat');
let generatePairingCode = null;
if (_sessionManager) {
    if (typeof _sessionManager === 'function') generatePairingCode = _sessionManager;
    else if (typeof _sessionManager.generatePairingCode === 'function') generatePairingCode = _sessionManager.generatePairingCode;
    else if (typeof _sessionManager.generate === 'function') generatePairingCode = _sessionManager.generate;
}
const getFakeVcard = require('../lib/fakeVcard');
const { isButtonModeOn } = require('../lib/buttonHelper');
const { normalizePairingNumber, parsePairingCode } = require('../lib/pairing');

let sendButtons;
try {
    sendButtons = require('kango-wa').sendButtons;
} catch (_) {
    sendButtons = null;
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363404284793169@newsletter',
            newsletterName: 'NEGO NEXUS',
            serverMessageId: -1
        }
    }
};

async function pairCommand(sock, chatId, message, args) {
    const t = getLang(sock);

    if (!message.key.fromMe) {
        await sock.sendMessage(chatId, { text: t.pair_owner_only, ...channelInfo }, { quoted: getFakeVcard() });
        return;
    }

    const raw = normalizePairingNumber(args[0]).replace(/^\+/, '');

    // Enforce pairing-number policy: require PAIRING_NUMBER to be configured
    const configured = normalizePairingNumber(global.PAIRING_NUMBER).replace(/^\+/, '');
    if (!configured) {
        await sock.sendMessage(chatId, { text: '❌ Pairing is disabled. Please set the PAIRING_NUMBER environment variable (your WhatsApp number without +) to enable pairing.' , ...channelInfo }, { quoted: getFakeVcard() });
        return;
    }

    if (!raw || raw.length < 7 || raw.length > 15) {
        await sock.sendMessage(chatId, { text: t.pair_usage, ...channelInfo }, { quoted: getFakeVcard() });
        return;
    }

    // Only allow pairing for configured number
    if (raw !== configured) {
        await sock.sendMessage(chatId, { text: `❌ Pairing is restricted. Please use the configured pairing number: +${configured}`, ...channelInfo }, { quoted: getFakeVcard() });
        return;
    }

    await sock.sendMessage(chatId, {
        text: t.pair_generating.replace('{number}', raw),
        ...channelInfo
    }, { quoted: getFakeVcard() });

    try {
        if (!generatePairingCode || typeof generatePairingCode !== 'function') {
            console.error('Pairing function unavailable from lib/sessionManager');
            await sock.sendMessage(chatId, { text: '❌ Pairing is currently unavailable on this build. Contact the bot owner.', ...channelInfo }, { quoted: getFakeVcard() });
            return;
        }

        const generated = await generatePairingCode(raw);
        const code = parsePairingCode(generated);

        if (!code) {
            await sock.sendMessage(chatId, {
                text: `✅ *+${raw}* is already linked to the bot!`,
                ...channelInfo
            }, { quoted: getFakeVcard() });
            return;
        }

        const response = t.pair_success
            .replace(/\{number\}/g, raw)
            .replace('{code}', code);

        if (isButtonModeOn() && sendButtons) {
            try {
                await sendButtons(sock, chatId, {
                    text: response,
                    footer: '© NEGO NEXUS',
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📋 Copy Code',
                                copy_code: code
                            })
                        }
                    ],
                    quoted: getFakeVcard(),
                    contextInfo: channelInfo.contextInfo
                });
            } catch (_) {
                await sock.sendMessage(chatId, { text: response, ...channelInfo }, { quoted: getFakeVcard() });
            }
        } else {
            await sock.sendMessage(chatId, { text: response, ...channelInfo }, { quoted: getFakeVcard() });
        }

    } catch (err) {
        if (err.message === 'ALREADY_ACTIVE') {
            await sock.sendMessage(chatId, {
                text: t.pair_already_active.replace('{number}', raw),
                ...channelInfo
            }, { quoted: getFakeVcard() });
        } else {
            console.error('Error in pair command:', err);
            await sock.sendMessage(chatId, { text: t.pair_failed, ...channelInfo }, { quoted: getFakeVcard() });
        }
    }
}

module.exports = pairCommand;
