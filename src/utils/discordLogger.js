const { Client, EmbedBuilder, VoiceState } = require('discord.js');
const logger = require('./logger');

const CHANNEL_ID = '1277072544268025870';

/**
 * @param {Client} client
 * @param {VoiceState} voiceState
 */
const voiceJoin = async (client, voiceState) => {
  const globalName = voiceState.member.user.globalName || voiceState.member.user.username;

  const embed = new EmbedBuilder()
    .setColor(0x41b3a2)
    .setAuthor({
      name: globalName,
      iconURL: voiceState.member.user.displayAvatarURL(),
    })
    .setTitle('Member joined voice channel')
    .setDescription(`**${globalName}** joined voice channel ${voiceState.channel.name}`)
    .setFooter({ text: `ID: ${voiceState.member.user.id}` })
    .setTimestamp();

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    logger.error(error, 'Error logging voice join');
  }
};

/**
 * @param {Client} client
 * @param {VoiceState} voiceState
 */
const voiceLeft = async (client, voiceState) => {
  const globalName = voiceState.member.user.globalName || voiceState.member.user.username;
  const channelName = voiceState.channel ? voiceState.channel.name : 'Unknown';

  const embed = new EmbedBuilder()
    .setColor(0xee4e4e)
    .setAuthor({
      name: globalName,
      iconURL: voiceState.member.user.displayAvatarURL(),
    })
    .setTitle('Member left voice channel')
    .setDescription(`**${globalName}** left voice channel ${channelName}`)
    .setFooter({ text: `ID: ${voiceState.member.user.id}` })
    .setTimestamp();

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    logger.error(error, 'Error logging voice left');
  }
};

module.exports = { voiceJoin, voiceLeft };
