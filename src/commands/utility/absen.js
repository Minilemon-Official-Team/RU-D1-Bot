const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { addAttendance } = require('../../controller/attendance');

const absences = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('absen')
    .setDescription('Kehadiran')
    .addSubcommand((subcommand) => subcommand.setName('hadir').setDescription('Absen status hadir'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('izin')
        .setDescription('Absen status izin')
        .addStringOption((option) =>
          option.setName('keterangan').setDescription('Tulis keterangan izin').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('sakit')
        .setDescription('Absen status sakit')
        .addStringOption((option) =>
          option.setName('keterangan').setDescription('Tulis keterangan sakit').setRequired(true),
        ),
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const CHANNEL_ID_ABSEN = [
      '1265538112927567954',
      '1259797796626894888',
      '1259798001287827527',
      '1259798045311369308',
      '1265523633820930188',
    ];

    if (!CHANNEL_ID_ABSEN.includes(interaction.channelId)) {
      await interaction.reply({
        embeds: [createErrorEmbed('Hanya bisa digunakan di text channel absen!')],
        ephemeral: true,
      });
      return;
    }

    if (isMonday()) {
      await interaction.reply({
        embeds: [createErrorEmbed('Happy weekend!')],
        ephemeral: true,
      });
      return;
    }

    if (!isAttendanceTime() && !isSaturday() && !isMonday()) {
      return interaction.reply({
        embeds: [createAttendanceNotStartedEmbed()],
        ephemeral: true,
      });
    }

    const commandName = interaction.options.getSubcommand();
    const keterangan = interaction.options.getString('keterangan');
    const member = interaction.member;

    const today = new Date().toDateString();

    try {
      let embedMessage;
      if (isSaturday()) {
        const absenceData = absences.get(member.user.id);

        if (absenceData && absenceData.date === today) {
          return interaction.reply({
            embeds: [createErrorEmbed('Anda sudah melakukan absen pada hari Sabtu ini.')],
            ephemeral: true,
          });
        }

        absences.set(member.user.id, {
          userId: member.user.id,
          status: commandName,
          keterangan,
          timestamp: interaction.createdTimestamp,
          date: today,
        });

        const embedMessage = createWeekendEmbed(
          member.user.id,
          commandName,
          false,
          keterangan,
          interaction.createdTimestamp,
        );

        return interaction.reply({ embeds: [embedMessage] });
      } else {
        const { attendance, timestamp } = await addAttendance({
          member,
          status: commandName,
          keterangan,
        });

        embedMessage = createSuccessEmbed(
          member.user.id,
          commandName,
          attendance.telat,
          keterangan,
          timestamp,
        );
      }

      await interaction.reply({ embeds: [embedMessage] });
    } catch (error) {
      await interaction.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
    }
  },
};

function isAttendanceTime() {
  const timeAttend = new Date().setHours(8, 45, 0, 0);
  return new Date() >= timeAttend;
}

function isSaturday() {
  const today = new Date();
  const day = today.getDay();
  return day === 6;
}

function isMonday() {
  const today = new Date();
  const day = today.getDay();
  return day === 0;
}

function cleanupOldAbsences() {
  const today = new Date().toDateString();
  for (const [userId, absenceData] of absences) {
    if (absenceData.date !== today) {
      absences.delete(userId);
    }
  }
}

cleanupOldAbsences();

setInterval(cleanupOldAbsences, 24 * 60 * 60 * 1000);

function createAttendanceNotStartedEmbed() {
  const timeAttend = new Date().setHours(8, 45, 0, 0);
  return new EmbedBuilder()
    .setColor('Blurple')
    .setDescription(`Absen dimulai dalam <t:${Math.floor(timeAttend / 1000)}:R>`);
}

function createWeekendEmbed(user_id, status, keterangan, timestamp) {
  let message = `<a:success:1275324158984720394>\u2009 <@${user_id}> tercatat **${status}** pada waktu <t:${timestamp}:t>. Happy Weekend!`;

  if (keterangan) {
    message += ` Keterangan: **${keterangan}**`;
  }

  return new EmbedBuilder().setColor('Blurple').setDescription(message);
}

function createSuccessEmbed(user_id, status, telat, keterangan, timestamp) {
  let message = `<a:success:1275324158984720394>\u2009 <@${user_id}> tercatat **${status}** pada waktu <t:${timestamp}:t>.`;

  if (telat) {
    message += ' **Terlambat!**';
  }

  if (keterangan) {
    message += ` Keterangan: **${keterangan}**`;
  }

  return new EmbedBuilder().setColor('Green').setDescription(message);
}

function createErrorEmbed(errorMessage) {
  return new EmbedBuilder().setColor('Red').setDescription(errorMessage);
}
