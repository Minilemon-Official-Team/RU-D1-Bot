const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.buttons = new Collection();

  const buttonPath = path.join(__dirname, '../buttons');
  const buttonFiles = fs.readdirSync(buttonPath).filter((file) => file.endsWith('.js'));

  for (const file of buttonFiles) {
    const filePath = path.join(buttonPath, file);
    const button = require(filePath);
    if ('name' in button && 'execute' in button) {
      client.buttons.set(button.name, button);
    }
  }
};
