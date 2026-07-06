const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const { getLang } = require('../lib/lang');

const DATA_PATH = path.join(__dirname, '..', 'data', 'antidemote.json');

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

async function antidemoteCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: `Only group admins can toggle antidemote.` });
            return;
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const arg = text.split(' ')[1] || '';
        const data = readData();

        if (!data[chatId]) data[chatId] = false;

        if (arg.toLowerCase() === 'on' || arg.toLowerCase() === 'enable') {
            data[chatId] = true;
            writeData(data);
            await sock.sendMessage(chatId, { text: 'Antidemote enabled for this group. If the bot is demoted suspiciously, the responsible user will be removed.' });
            return;
        }

        if (arg.toLowerCase() === 'off' || arg.toLowerCase() === 'disable') {
            data[chatId] = false;
            writeData(data);
            await sock.sendMessage(chatId, { text: 'Antidemote disabled for this group.' });
            return;
        }

        await sock.sendMessage(chatId, { text: 'Usage: .antidemote on|off' });
    } catch (error) {
        console.error('Error in antidemote command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to toggle antidemote.' });
    }
}

module.exports = antidemoteCommand;
