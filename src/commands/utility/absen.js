const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');
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
    await interaction.deferReply();

    const CHANNEL_ID_ABSEN = [
      '1265538112927567954',
      '1259797796626894888',
      '1259798001287827527',
      '1259798045311369308',
      '1265523633820930188',
    ];

    if (
      !CHANNEL_ID_ABSEN.includes(interaction.channelId) &&
      !interaction.channelId.includes('1277831891042570329')
    ) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Hanya bisa digunakan di text channel absen!')],
        ephemeral: true,
      });
      return;
    }

    if (isMonday()) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Happy weekend!')],
        ephemeral: true,
      });
      return;
    }

    if (!isAttendanceTime() && !isSaturday()) {
      return interaction.editReply({
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
          const sentMessage = await interaction.editReply({
            embeds: [
              createErrorEmbed(`<@${member.user.id}> Anda sudah melakukan absen pada hari ini.`),
            ],
          });

          setTimeout(() => {
            sentMessage.delete();
          }, 60000);
          return;
        }

        console.log({ absenceData });

        absences.set(member.user.id, {
          userId: member.user.id,
          status: commandName,
          keterangan,
          timestamp: Math.floor(interaction.createdTimestamp / 1000),
          date: today,
        });

        console.log({ absences });

        const embedMessage = createWeekendEmbed(
          member.user.id,
          commandName,
          keterangan,
          Math.floor(interaction.createdTimestamp / 1000),
        );

        return interaction.editReply({ embeds: [embedMessage] });
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

      await interaction.editReply({ embeds: [embedMessage] });
    } catch (error) {
      const message = await interaction.editReply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });

      setTimeout(() => message.delete(), 60000);
    }
  },
};

function isAttendanceTime() {
  const now = DateTime.now().setZone('Asia/Jakarta');
  const timeAttend = now.set({ hour: 8, minute: 45, second: 0, millisecond: 0 });

  return now >= timeAttend;
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
  const timeAttend = DateTime.now()
    .setZone('Asia/Jakarta')
    .set({ hour: 8, minute: 45, second: 0, millisecond: 0 });
  const unixTimeAttend = Math.floor(timeAttend.toSeconds());

  return new EmbedBuilder()
    .setColor('Blurple')
    .setDescription(`Absen dimulai dalam <t:${unixTimeAttend}:R>`);
}

function createWeekendEmbed(user_id, status, keterangan, timestamp) {
  console.log({ user_id, status, keterangan, timestamp });
  let message = `<a:success:1275324158984720394>\u2009 <@${user_id}> tercatat **${status}** pada waktu <t:${timestamp}:t>`;

  if (keterangan) {
    message += `. Keterangan: **${keterangan}**`;
  }

  message += '. Happy weekend!';

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
