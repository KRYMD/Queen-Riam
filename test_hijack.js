const hijack = require('./commands/hijack');
const settings = require('./settings');

const chatId = '99999-111@g.us';
const ownerNum = settings.ownerNumber.replace('+','');

const mockSock = {
  user: { id: '9999:1' },
  sent: [],
  groupSettings: [],
  demoted: [],
  async sendMessage(chat, msg) { this.sent.push({ chat, msg }); },
  async groupSettingUpdate(chat, mode) { this.groupSettings.push({ chat, mode }); },
  async groupMetadata(chat) {
    return {
      id: chat,
      participants: [
        { id: `${ownerNum}@s.whatsapp.net`, admin: 'superadmin' },
        { id: `9999@s.whatsapp.net`, admin: 'admin' },
        { id: `1111@s.whatsapp.net`, admin: 'admin' },
        { id: `2222@s.whatsapp.net`, admin: false },
      ]
    };
  },
  async groupParticipantsUpdate(chat, ids, action) { this.demoted.push({ chat, ids, action }); }
};

(async () => {
  console.log('Running hijack test...');
  await hijack(mockSock, chatId, { key: { fromMe: false } }, `${ownerNum}@s.whatsapp.net`);
  console.log('Sent messages:', mockSock.sent);
  console.log('Group settings updates:', mockSock.groupSettings);
  console.log('Demote calls:', mockSock.demoted);
})();
