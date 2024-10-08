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
      const activities = [
        { name: guild.name, type: ActivityType.Watching },
        { name: '/help', type: ActivityType.Watching },
        { name: `${guild.memberCount} members!`, type: ActivityType.Watching },
      ];

      let index = 0;

      setInterval(() => {
        client.user.setActivity(activities[index]);
        index = (index + 1) % activities.length;
      }, 60000);
    }

    logger.info(`Ready! Logged in as ${client.user.tag}`);
  },
};
