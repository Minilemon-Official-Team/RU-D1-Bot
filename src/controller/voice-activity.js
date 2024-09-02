const voiceActivity = require('../services/voice-activity');
const logger = require('../utils/logger');
const { ensureUserExists } = require('./user');

const addVoiceActivity = async (member, hours) => {
  await ensureUserExists(member);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activity = await voiceActivity.getVoiceActivityUserByDate({
    user_id: member.user.id,
    date: today,
  });

  if (activity) {
    const updatedVoiceActivity = await voiceActivity.updateVoiceActivity({
      user_id: member.user.id,
      active_hours: activity.active_hours + hours,
      date: today,
    });
    return updatedVoiceActivity;
  } else {
    const addedVoiceActivity = await voiceActivity.addVoiceActivity({
      user_id: member.user.id,
      active_hours: hours,
      date: today,
    });
    return addedVoiceActivity;
  }
};

const getActiveHours = async (user_id) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const { active_hours } = await voiceActivity.getVoiceActivityUserByDate({
      user_id,
      date: today,
    });
    const monthlyActiveDiscord = await voiceActivity.getMonthlyVoiceActiveByUser(user_id);

    return {
      todayActiveDiscord: active_hours ?? null,
      monthlyActiveDiscord,
    };
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { addVoiceActivity, getActiveHours };
