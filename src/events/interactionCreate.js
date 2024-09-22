const { Events, BaseInteraction, Client, Collection, EmbedBuilder } = require('discord.js');
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

      const { cooldowns } = interaction.client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3;
      const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1_000);
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xc1cf02)
                .setDescription(
                  `Kamu dalam cooldown untuk command \`${command.data.name}\`. Kamu dapat menggunakan command <t:${expiredTimestamp}:R>.`,
                ),
            ],
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

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
