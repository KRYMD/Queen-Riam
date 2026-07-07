const getFakeVcard = require('../lib/fakeVcard');
const { CATEGORIES } = require('./help');

module.exports = async function menuCommand(sock, chatId, message, args = []) {
    try {
        const sub = Array.isArray(args) ? args[0] : args;
        const helpCommand = require('./help');

        if (sub && CATEGORIES[sub]) {
            await helpCommand(sock, chatId, message, null, sub);
            return;
        }

        await helpCommand(sock, chatId, message, null, null);
    } catch (err) {
        console.error('[MENU] Failed to run menu command:', err);
        try {
            await sock.sendMessage(chatId, { text: 'Failed to show menu. Try .help' }, { quoted: getFakeVcard() });
        } catch (_) {}
    }
};
