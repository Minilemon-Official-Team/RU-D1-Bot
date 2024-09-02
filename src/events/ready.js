const { Events, Client, ActivityType } = require('discord.js');
const connectDB = require('../config/db');
const logger = require('../utils/logger');
const { GUILD_ID } = require('../config/config');

module.exports = {
  name: Events.ClientReady,
  once: true,
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    connectDB();
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
      client.user.setActivity({ name: guild.name, type: ActivityType.Watching });
    }

    logger.info(`Ready! Logged in as ${client.user.tag}`);
  },
};
