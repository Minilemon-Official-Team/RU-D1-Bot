const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const {
  getWeeklyAttendanceStatus,
  getMonthlyAttendanceStatus,
} = require('../../controller/attendance');
const { getMonthlyPointsByUser } = require('../../services/point');
const { getActiveHours } = require('../../controller/voice-activity');
const { ensureUserExists } = require('../../controller/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Profile statistik')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stat')
        .setDescription('Statistik profile')
        .addUserOption((option) =>
          option.setName('user').setDescription('Statistik profile user lain').setRequired(false),
        ),
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { user, options } = interaction;
    const userChoice = options.getUser('user');

    const getStatisticEmbed = ({
      name = 'Unknown',
      weeklyStatus = 'N/A',
      monthlyStatus = 'N/A',
      monthlyPoints = { addPoints: 0, minusPoints: 0 },
      activeDiscord = { todayActiveDiscord: 0, monthlyActiveDiscord: 0 },
      division = { id: '0', name: 'Unknown' },
      thumbnail = '',
    }) => {
      const todayActive =
        typeof activeDiscord.todayActiveDiscord === 'number'
          ? activeDiscord.todayActiveDiscord.toFixed(2)
          : 0;
      const monthlyActive =
        typeof activeDiscord.monthlyActiveDiscord === 'number'
          ? activeDiscord.monthlyActiveDiscord.toFixed(2)
          : 0;

      return new EmbedBuilder()
        .setColor(0xffd30a)
        .setTitle('Profile Statistic')
        .addFields(
          { name: 'Nama', value: name, inline: false },
          { name: 'Divisi', value: `<@&${division.id}>`, inline: false },
          { name: 'Weekly Absen', value: weeklyStatus, inline: false },
          { name: 'Monthly Absen', value: monthlyStatus, inline: false },
          { name: '\t', value: '\t', inline: false },
          {
            name: 'Today Active Discord',
            value: `🔉 **Workspace**: ${todayActive} hours`,
            inline: true,
          },
          {
            name: 'Monthly Active Discord',
            value: `🔉 **Workspace**: ${monthlyActive} hours`,
            inline: true,
          },
          { name: '\t', value: '\t', inline: false },
          {
            name: 'Monthly Points',
            value: `**${monthlyPoints.addPoints}** Points`,
            inline: true,
          },
          {
            name: 'Minus Points',
            value: `**${monthlyPoints.minusPoints}** Points`,
            inline: true,
          },
        )
        .setThumbnail(thumbnail);
    };

    try {
      const targetMember = userChoice
        ? interaction.guild.members.cache.get(userChoice.id)
        : interaction.guild.members.cache.get(user.id);

      if (userChoice && userChoice.bot) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder().setColor('Red').setDescription('User yang anda pilih adalah bot!'),
          ],
          ephemeral: true,
        });
      }

      if (!targetMember) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setDescription('User tidak ditemukan di server ini!'),
          ],
          ephemeral: true,
        });
      }

      const weeklyStatus = await getWeeklyAttendanceStatus(targetMember.id);
      const monthlyStatus = await getMonthlyAttendanceStatus(targetMember.id);
      const monthlyPoints = await getMonthlyPointsByUser(targetMember.id);
      await ensureUserExists(targetMember);
      const activeDiscord = await getActiveHours(targetMember.id);

      const statisticEmbed = getStatisticEmbed({
        name: targetMember.displayName,
        weeklyStatus,
        monthlyStatus,
        monthlyPoints,
        division: targetMember.roles.highest,
        activeDiscord,
        thumbnail: targetMember.user.displayAvatarURL(),
      });
      await interaction.reply({ embeds: [statisticEmbed] });
    } catch (error) {
      logger.error(error, 'Error handling profile-stat command:');
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setDescription('Terjadi kesalahan dalam memproses statistik.'),
        ],
        ephemeral: true,
      });
    }
  },
};
