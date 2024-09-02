const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.prefixCommands = new Collection();

  const prefixPath = path.join(__dirname, '../prefix');
  const prefixFiles = fs.readdirSync(prefixPath).filter((file) => file.endsWith('.js'));

  for (const file of prefixFiles) {
    const filePath = path.join(prefixPath, file);
    const prefix = require(filePath);
    if ('name' in prefix && 'execute' in prefix) {
      client.prefixCommands.set(prefix.name, prefix);
    }
  }
};
