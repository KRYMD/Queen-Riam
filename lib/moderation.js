const fs = require('fs');
const path = require('path');

const ANTIDEMOTE_PATH = path.join(__dirname, '..', 'data', 'antidemote.json');
const ANTIMENTION_PATH = path.join(__dirname, '..', 'data', 'antigroupmention.json');

function readJson(p) {
    try { return JSON.parse(fs.readFileSync(p,'utf8')) || {}; } catch(e){ return {}; }
}

async function handleParticipantUpdate(sock, chatId, update) {
    // update example shape depends on main.js events. This handler expects an object
    // { action: 'demote'|'promote'|'remove', participants: [...], author }
    try {
        const data = readJson(ANTIDEMOTE_PATH);
        if (!data[chatId]) return;

        if (update.action === 'demote' && update.participants) {
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const demotedBot = update.participants.find(p => p === botId);
            if (demotedBot) {
                const offender = update.author; // author should be jid
                if (offender) {
                    try {
                        await sock.groupParticipantsUpdate(chatId, [offender], 'remove');
                        await sock.sendMessage(chatId, { text: `Removed ${offender} for demoting the bot.` });
                    } catch (e) {
                        console.error('Failed to remove offender for antidemote', e);
                    }
                }
            }
        }
    } catch (e) {
        console.error('moderation.handleParticipantUpdate error', e);
    }
}

async function handleStatusMessage(sock, chatId, sender, text, message) {
    // This should be called when someone posts a private status that mentions the group name.
    // The bot owner must integrate caller points from main.js where message.type === 'status' or similar.
    try {
        const data = readJson(ANTIMENTION_PATH);
        const groupAction = data[chatId];
        if (!groupAction) return;

        if (!text) return;

        // check for a mention of group name (simple heuristic)
        // In practice main.js must call this with sufficient context.
        const groupName = (await sock.groupMetadata(chatId)).subject || '';
        if (!groupName) return;

        if (text.includes(groupName) || text.toLowerCase().includes('group')) {
            if (groupAction === 'delete') {
                // cannot delete other's status via API; notify admin
                await sock.sendMessage(chatId, { text: `${sender} mentioned the group in a private status — configured action: delete (please review).` });
            } else if (groupAction === 'kick') {
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
            } else if (groupAction === 'warn') {
                await sock.sendMessage(chatId, { text: `@${sender.split('@')[0]} Please do not mention the group in private status.`, mentions:[sender] });
            }
        }
    } catch (e) {
        console.error('moderation.handleStatusMessage error', e);
    }
}

module.exports = { handleParticipantUpdate, handleStatusMessage };
