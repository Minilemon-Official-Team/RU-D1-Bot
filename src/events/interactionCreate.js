const { Events, BaseInteraction, Client } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {BaseInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      logger.info(
        `[COMMAND EXECUTE] User: ${interaction.user.username} (ID: ${interaction.user.id}) executed command: /${interaction.commandName}`,
      );

      if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(error, 'Error executing command');
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      const button = interaction.client.buttons.get(interaction.customId);
      logger.info(
        `[BUTTON EXECUTE] ${interaction.customId} executed by ${interaction.user.username}`,
      );

      if (!button) {
        logger.warn(`No button matching ${interaction.customId} was found.`);
        return;
      }

      try {
        await button.execute(interaction);
      } catch (error) {
        logger.error(error, 'Error executing button');
        await interaction.reply({
          content: 'There was an error while processing this button!',
          ephemeral: true,
        });
      }
    }
  },
};
