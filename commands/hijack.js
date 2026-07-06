const settings = require('../settings');
const isAdminHelper = require('../lib/isAdmin');

async function hijackCommand(sock, chatId, message, senderId) {
    try {
        const caller = senderId.split('@')[0];
        const ownerNumber = settings.ownerNumber.replace('+','');

        if (!caller.includes(ownerNumber)) {
            await sock.sendMessage(chatId, { text: 'Only the bot owner can run hijack.' });
            return;
        }

        const { isBotAdmin } = await isAdminHelper(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'I need to be an admin to perform hijack. Please make the bot an admin and try again.' });
            return;
        }

        // Lock group (announcement only)
        await sock.groupSettingUpdate(chatId, 'announcement');

        // Attempt to demote other admins except the bot and the owner
        const metadata = await sock.groupMetadata(chatId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const adminsToDemote = metadata.participants
            .filter(p => (p.admin === 'admin' || p.admin === 'superadmin'))
            .map(p => p.id)
            .filter(id => id !== botId && !id.includes(ownerNumber));

        if (adminsToDemote.length > 0) {
            try {
                await sock.groupParticipantsUpdate(chatId, adminsToDemote, 'demote');
            } catch (err) {
                // ignore individual failures
            }
        }

        await sock.sendMessage(chatId, { text: 'Hijack complete: group locked and other admins demoted where possible.' });
    } catch (error) {
        console.error('Error in hijack command:', error);
        try { await sock.sendMessage(chatId, { text: 'Failed to execute hijack command.' }); } catch(e){}
    }
}

module.exports = hijackCommand;
