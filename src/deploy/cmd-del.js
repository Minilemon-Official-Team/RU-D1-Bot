require('dotenv').config();
const { TOKEN, CLIENT_ID, GUILD_ID } = require('../config/config');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

const commands = [];

const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      logger.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    rest
      .put(Routes.applicationCommands(CLIENT_ID), { body: [] })
      .then(() => logger.info('Successfully deleted all application commands.'));
    rest
      .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] })
      .then(() => logger.info('Successfully deleted all guild minilemon commands.'));
  } catch (error) {
    logger.error(error);
  }
})();
