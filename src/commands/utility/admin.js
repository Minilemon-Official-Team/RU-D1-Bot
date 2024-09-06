const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { addAdmin, deleteAdmin } = require('../../controller/admin');
const { getAllAdmin } = require('../../services/admin');
const { AUTHOR_ID } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('[RESTRICTED] Admin commands.')
    .addSubcommand((command) =>
      command
        .setName('add')
        .setDescription('[RESTRICTED] Menambahkan admin baru.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Pilih user').setRequired(true),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName('delete')
        .setDescription('[RESTRICTED] Menghapus admin.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Pilih user').setRequired(true),
        ),
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const admins = await getAllAdmin();
    const commandName = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    if (interaction.user.bot) return;

    if (!admins.includes(interaction.user.id) && interaction.user.id !== AUTHOR_ID) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setDescription(
              'Anda tidak memiliki izin untuk menggunakan command ini! <a:amor:1275258588608069756>',
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (user.bot) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor('Red').setDescription('User yang anda pilih adalah bot!'),
        ],
        ephemeral: true,
      });
      return;
    }

    try {
      if (commandName == 'add') {
        await addAdmin(user.id);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x6962ad)
              .setDescription(`Berhasil menambahkan ${user} sebagai admin.`),
          ],
          ephemeral: true,
        });
      } else if (commandName == 'delete') {
        await deleteAdmin(user.id);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x6962ad)
              .setDescription(`Berhasil menghapus ${user} dari admin.`),
          ],
          ephemeral: true,
        });
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor('Red').setDescription(error.message)],
        ephemeral: true,
      });
    }
  },
};
