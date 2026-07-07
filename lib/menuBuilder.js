const settings = require('../settings');
const { CATEGORIES } = require('../commands/help');

function formatTime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds = seconds % (24 * 60 * 60);
  const hours = Math.floor(seconds / (60 * 60));
  seconds = seconds % (60 * 60);
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  let time = '';
  if (days > 0) time += `${days}d `;
  if (hours > 0) time += `${hours}h `;
  if (minutes > 0) time += `${minutes}m `;
  if (seconds > 0 || time === '') time += `${seconds}s`;

  return time.trim();
}

function buildMainMenuText() {
  const prefix = settings.prefix || '.';
  const mode = settings.commandMode === 'public' ? 'public' : 'private';
  const uptime = formatTime(process.uptime());

  const lines = [
    '╔══════════════════════════════╗',
    '║      👑 NEGO NEXUS MENU     ║',
    '╚══════════════════════════════╝',
    '',
    `⚡ Prefix: ${prefix}   • Mode: ${mode}   • Uptime: ${uptime}`,
    '📚 Send any command below to use it instantly.',
    '',
  ];

  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const sectionTitle = `${cat.emoji} *${cat.title}*`;
    const commands = cat.commands.join('  •  ');
    lines.push(`◈ ${sectionTitle}`);
    lines.push(commands);
    lines.push('');
  }

  lines.push('💡 Tip: Use .help <category> for a focused view.');
  lines.push('');
  lines.push('© Nego Nexus');

  return lines.join('\n');
}

module.exports = { buildMainMenuText };
