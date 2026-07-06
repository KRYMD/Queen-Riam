const getFakeVcard = require('../lib/fakeVcard');

// Delegates to the existing help command implementation so menu aliases work.
module.exports = async function menuCommand(sock, chatId, message, args, maybeSub) {
    try {
        const helpCommand = require('./help');

        // Determine subcategory if provided either as arg array/string or in the message text
        let sub = null;
        if (typeof maybeSub === 'string' && maybeSub.trim()) sub = maybeSub.trim();
        else if (typeof args === 'string' && args.trim()) {
            const parts = args.trim().split(/\s+/);
            if (parts.length > 0) sub = parts[0];
        } else if (Array.isArray(args) && args.length > 0 && typeof args[0] === 'string') {
            sub = args[0].trim();
        } else if (message && message.message) {
            // attempt to extract text from common WA message shapes
            const convo = message.message.conversation || (message.message.extendedTextMessage && message.message.extendedTextMessage.text) || '';
            const parts = (convo || '').trim().split(/\s+/);
            if (parts.length > 1) sub = parts[1];
        }

        // Call the help command with subcategory (helpCommand signature: (sock, chatId, message, _, subCategory))
        await helpCommand(sock, chatId, message, null, sub);
    } catch (err) {
        console.error('[MENU] Failed to run menu command:', err);
        try {
            await sock.sendMessage(chatId, { text: 'Failed to show menu. Try .help' }, { quoted: getFakeVcard() });
        } catch (_) {}
    }
};
