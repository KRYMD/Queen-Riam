const getFakeVcard = require('../lib/fakeVcard');
const { buildMainMenuText } = require('../lib/menuBuilder');
const { CATEGORIES } = require('./help');
const { isButtonModeOn } = require('../lib/buttonHelper');

let sendButtons;
try {
    sendButtons = require('kango-wa').sendButtons;
} catch (_) {
    sendButtons = null;
}

function getChannelInfo() {
    return {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363404284793169@newsletter',
                newsletterName: '👑 NEGO NEXUS',
                serverMessageId: -1,
            },
        },
    };
}

module.exports = async function menuCommand(sock, chatId, message, args = []) {
    try {
        const sub = Array.isArray(args) ? args[0] : args;
        if (sub && CATEGORIES[sub]) {
            const helpCommand = require('./help');
            await helpCommand(sock, chatId, message, null, sub);
            return;
        }

        const menuText = buildMainMenuText();
        const channelInfo = getChannelInfo();

        if (isButtonModeOn() && sendButtons) {
            const buttons = [
                { id: '.help', text: '📜 Full Help' },
                ...Object.entries(CATEGORIES).map(([key, cat]) => ({
                    id: `.help ${key}`,
                    text: `${cat.emoji} ${cat.title}`,
                })),
            ];

            await sendButtons(sock, chatId, {
                text: `${menuText}\n\nTap a category below to open it.`,
                footer: '👑 Queen Riam',
                buttons,
                quoted: getFakeVcard(),
                contextInfo: channelInfo.contextInfo,
            });
            return;
        }

        await sock.sendMessage(chatId, { text: menuText, ...channelInfo }, { quoted: getFakeVcard() });
    } catch (err) {
        console.error('[MENU] Failed to run menu command:', err);
        try {
            await sock.sendMessage(chatId, { text: 'Failed to show menu. Try .help' }, { quoted: getFakeVcard() });
        } catch (_) {}
    }
};
