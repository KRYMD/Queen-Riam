const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const DATA_PATH = path.join(__dirname, '..', 'data', 'antigroupmention.json');

function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) || {};
    } catch (e) {
        return {};
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function antigroupmentionCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: `Only group admins can configure antigroupmention.` });
            return;
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const arg = text.split(' ')[1] || '';
        const data = readData();

        if (!['delete','kick','warn','off'].includes(arg.toLowerCase())) {
            await sock.sendMessage(chatId, { text: 'Usage: .antigroupmention delete|kick|warn|off' });
            return;
        }

        if (arg.toLowerCase() === 'off') {
            delete data[chatId];
            writeData(data);
            await sock.sendMessage(chatId, { text: 'Antigroupmention disabled for this group.' });
            return;
        }

        data[chatId] = arg.toLowerCase();
        writeData(data);
        await sock.sendMessage(chatId, { text: `Antigroupmention set to '${arg.toLowerCase()}' for this group.` });
    } catch (error) {
        console.error('Error in antigroupmention command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to configure antigroupmention.' });
    }
}

module.exports = antigroupmentionCommand;
