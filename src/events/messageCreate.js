const { Events, Message } = require('discord.js');
const { PREFIX, GUILD_ID } = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  /**
   *
   * @param {Message} message
   * @returns
   */
  async execute(message) {
    if (message.author.bot || message.guild.id !== GUILD_ID) return;

    if (
      message.content.toLowerCase().startsWith('#absen-pagi') ||
      message.content.toLowerCase().startsWith('#absen-hadir') ||
      message.content.toLowerCase().startsWith('#absen hadir')
    ) {
      const command = message.client.prefixCommands.get('absen');
      if (!command) return;

      try {
        await command.execute(message);
      } catch (error) {
        logger.error(error, 'Error executing absen-pagi command');
        message.reply({ content: 'There was an error while executing this command!' });
      }
    } else if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = message.client.prefixCommands.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args);
      } catch (error) {
        logger.error(error, 'Error executing command');
        message.reply({ content: 'There was an error while executing this command!' });
      }
    }
  },
};
