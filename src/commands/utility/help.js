const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Menampilkan list commands.'),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTitle('Help')
      .setDescription('List of commands:')
      .addFields(
        {
          name: 'General',
          value:
            'Command-command ini dapat digunakan oleh semua user.\n' +
            '- **/absen hadir** - Mencatat absen dengan status hadir.\n' +
            '- **/absen izin** - Mencatat absen dengan status izin.\n' +
            '- **/absen sakit** - Mencatat absen dengan status sakit.\n' +
            '- **/profile stat** - Menampilkan informasi profil.',
          inline: false,
        },
        {
          name: 'Restricted',
          value:
            'Hanya user tertentu yang dapat menggunakan command ini.\n' +
            '- **/admin add** - Menambahkan admin baru.\n' +
            '- **/admin delete** - Menghapus admin.\n' +
            '- **/point add** - Menambahkan poin.\n' +
            '- **/point minus** - Mengurangi poin.\n' +
            '- **/point adjust** - Mengoreksi kesalahan poin yang telah diberikan.\n' +
            '- **/point clear all** - Menghapus semua poin seluruh user.\n' +
            '- **/point clear user** - Menghapus seluruh poin user yang dipilih.',
          inline: false,
        },
      )
      .setColor(0x0099ff)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({
      embeds: [embed],
    });
  },
};
