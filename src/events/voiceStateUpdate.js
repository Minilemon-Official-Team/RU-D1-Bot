const { Events, VoiceState, Client } = require('discord.js');
const { DateTime } = require('luxon');
const { addVoiceActivity } = require('../controller/voice-activity');
const { GUILD_ID } = require('../config/config');
const logger = require('../utils/logger');
const discordLogger = require('../utils/discordLogger');

const userJoinTimes = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,

  /**
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   * @param {Client} client
   */
  async execute(oldState, newState, client) {
    const isWithinActivityHours = () => {
      const now = DateTime.now().setZone('Asia/Jakarta');

      const start = now.set({ hour: 8, minute: 45 });
      const end = now.set({ hour: 17, minute: 0 });

      return now >= start && now <= end;
    };

    const handleVoiceStateUpdate = async (oldState, newState) => {
      if (!isWithinActivityHours()) return;
      if (oldState.member?.user.bot && newState.member?.user.bot) return;

      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;

      if (!oldState.channelId && newState.channelId) {
        userJoinTimes.set(newState.member.id, currentHour);
        logger.info(
          `[VOICE JOIN] User: ${newState.member.user.username} (ID: ${newState.member.user.id}) joined Voice Channel: ${newState.channel.name} (ID: ${newState.channel.id})`,
        );
        await discordLogger.voiceJoin(client, newState);
      }

      if (oldState.channelId && !newState.channelId) {
        const leaveHour = currentHour;
        logger.info(
          `[VOICE LEAVE] User: ${oldState.member.user.username} (ID: ${oldState.member.user.id}) left Voice Channel: ${oldState.channel.name} (ID: ${oldState.channel.id})`,
        );
        await discordLogger.voiceLeft(client, oldState);

        const joinHour = userJoinTimes.get(oldState.member.id);
        if (joinHour !== undefined) {
          const duration = leaveHour - joinHour;
          try {
            await addVoiceActivity(oldState.member, duration);
          } catch (error) {
            logger.error(error, 'Error adding voice activity');
          }
          userJoinTimes.delete(oldState.member.id);
        } else {
          logger.warn(`Could not calculate duration for ${oldState.member.user.username}`);
        }
      }
    };

    if (oldState.guild.id !== GUILD_ID || newState.guild.id !== GUILD_ID) return;

    await handleVoiceStateUpdate(oldState, newState);
  },
};
