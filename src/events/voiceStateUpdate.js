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
    const now = DateTime.now().setZone('Asia/Jakarta');
    const start = now.set({ hour: 8, minute: 45 });
    const end = now.set({ hour: 17, minute: 0 });

    const handleVoiceStateUpdate = async (oldState, newState) => {
      if (oldState.member?.user.bot && newState.member?.user.bot) return;

      const getCurrentTime = () => {
        const now = DateTime.now().setZone('Asia/Jakarta');
        return now.hour + now.minute / 60;
      };

      if (!oldState.channelId && newState.channelId) {
        const joinTime = Math.max(getCurrentTime(), start.hour + start.minute / 60);

        if (joinTime >= end.hour + end.minute / 60) {
          return;
        }

        userJoinTimes.set(newState.member.id, joinTime);
        logger.info(
          `[VOICE JOIN] User: ${newState.member.user.username} (ID: ${newState.member.user.id}) joined Voice Channel: ${newState.channel.name} (ID: ${newState.channel.id})`,
        );
        await discordLogger.voiceJoin(client, newState);
      }

      if (oldState.channelId && !newState.channelId) {
        const leaveTime = Math.min(getCurrentTime(), end.hour + end.minute / 60);
        const joinTime = userJoinTimes.get(oldState.member.id);

        logger.info(
          `[VOICE LEAVE] User: ${oldState.member.user.username} (ID: ${oldState.member.user.id}) left Voice Channel: ${oldState.channel.name} (ID: ${oldState.channel.id})`,
        );
        await discordLogger.voiceLeft(client, oldState);

        if (joinTime !== undefined) {
          let duration = leaveTime - joinTime;

          if (duration > 0) {
            if (duration > 8) {
              duration = 8;
            }
            try {
              await addVoiceActivity(oldState.member, duration);
            } catch (error) {
              logger.error(error, 'Error adding voice activity');
            }
          }
          userJoinTimes.delete(oldState.member.id);
        } else {
          logger.warn(`Could not calculate duration for ${oldState.member.user.username}`);
        }
      }
    };

    // Hanya eksekusi di guild yang sesuai
    if (oldState.guild.id !== GUILD_ID || newState.guild.id !== GUILD_ID) return;

    await handleVoiceStateUpdate(oldState, newState);
  },
};
