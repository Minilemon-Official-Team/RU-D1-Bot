const { Message, EmbedBuilder } = require('discord.js');
const { addAttendance } = require('../controller/attendance');

const absences = new Map();

module.exports = {
  name: 'absen',
  /**
   *
   * @param {Message} message
   */
  async execute(message) {
    const CHANNEL_ID_ABSEN = [
      '1265538112927567954',
      '1259797796626894888',
      '1259798001287827527',
      '1259798045311369308',
      '1265523633820930188',
    ];

    if (!CHANNEL_ID_ABSEN.includes(message.channelId)) {
      await message.delete();
      const sentMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setDescription(`<@${message.author.id}> Hanya bisa digunakan di text channel absen!`),
        ],
      });

      setTimeout(() => {
        sentMessage.delete();
      }, 60000);
      return;
    }

    if (isMonday()) {
      await message.delete();
      const sentMessage = await message.reply({
        embeds: [new EmbedBuilder().setColor('Red').setDescription('Happy weekend!')],
      });
      setTimeout(() => {
        sentMessage.delete();
      }, 60000);
      return;
    }

    if (!isAttendanceTime() && !isSaturday()) {
      await message.delete();
      const sentMessage = await message.channel.send({
        embeds: [createAttendanceNotStartedEmbed()],
      });
      setTimeout(() => {
        sentMessage.delete();
      }, 60000);
      return;
    }

    const member = message.member;
    const user_id = message.author.id;
    const today = new Date().toDateString();

    try {
      if (isSaturday()) {
        const absenceData = absences.get(user_id);

        if (absenceData && absenceData.date === today) {
          const sentMessage = await message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription('Anda sudah melakukan absen pada hari Sabtu ini.'),
            ],
          });
          setTimeout(() => {
            sentMessage.delete();
          }, 60000);
          return;
        }

        absences.set(user_id, {
          userId: user_id,
          status: 'hadir',
          keterangan: null,
          timestamp: Date.now(),
          date: today,
        });

        const embedMessage = new EmbedBuilder()
          .setColor('Blurple')
          .setDescription(
            `<a:success:1275324158984720394>\u2009 <@${user_id}> tercatat **hadir** pada hari Sabtu ini. Happy Weekend!`,
          );

        await message.channel.send({ embeds: [embedMessage] });
      } else {
        const { attendance, timestamp } = await addAttendance({
          member,
          status: 'hadir',
          keterangan: null,
        });

        const embedMessage = new EmbedBuilder()
          .setColor('Green')
          .setDescription(
            `<a:success:1275324158984720394>\u2009 <@${user_id}> tercatat **hadir** pada waktu <t:${timestamp}:t>. ${
              attendance.telat ? ' **Terlambat!**.' : ''
            }`,
          );

        await message.channel.send({ embeds: [embedMessage] });
      }
    } catch (error) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(`${error.message}`);
      const sentMessage = await message.reply({ embeds: [embed] });
      setTimeout(() => {
        sentMessage.delete().catch(console.error);
      }, 60000);
    } finally {
      await message.delete();
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

function createAttendanceNotStartedEmbed() {
  const timeAttend = new Date().setHours(8, 45, 0, 0);
  return new EmbedBuilder()
    .setColor('Blurple')
    .setDescription(`Absen dimulai dalam <t:${Math.floor(timeAttend / 1000)}:R>`);
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
