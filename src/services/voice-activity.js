const VoiceActivity = require('../models/voice-activity');
const logger = require('../utils/logger');

const addVoiceActivity = async ({ user_id, active_hours, date }) => {
  try {
    const voiceActivity = new VoiceActivity({ user_id, active_hours, date });
    await voiceActivity.save();
    return voiceActivity;
  } catch (error) {
    logger.error(error, 'Error adding voice activity');
    throw error;
  }
};

const updateVoiceActivity = async ({ user_id, active_hours, date }) => {
  try {
    const updatedVoiceActivity = await VoiceActivity.findOneAndUpdate(
      { user_id, date },
      { active_hours },
      { new: true },
    );
    return updatedVoiceActivity;
  } catch (error) {
    logger.error(error, 'Error updating voice activity');
    throw error;
  }
};

const getVoiceActivityUserByDate = async ({ user_id, date }) => {
  try {
    const activity = await VoiceActivity.findOne({
      user_id,
      date,
    });
    return activity || 0;
  } catch (error) {
    logger.error(error, 'Error getting voice activiy');
    throw error;
  }
};

const getVoiceActivityUserByDateRange = async ({ user_id, startDate, endDate }) => {
  try {
    const activity = await VoiceActivity.find({
      user_id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    return activity || [];
  } catch (error) {
    logger.error(error, 'Error getting monthly voice activiy');
    throw error;
  }
};

const getMonthlyVoiceActiveByUser = async (user_id) => {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setUTCMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setUTCDate(0);
  endOfMonth.setUTCHours(23, 59, 59, 999);

  const result = await VoiceActivity.aggregate([
    {
      $match: {
        user_id: user_id,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $group: {
        _id: '$user_id',
        totalActiveHours: { $sum: '$active_hours' },
      },
    },
  ]);

  const totalActiveHours = result.length > 0 ? result[0].totalActiveHours : null;

  return totalActiveHours;
};

module.exports = {
  addVoiceActivity,
  updateVoiceActivity,
  getVoiceActivityUserByDate,
  getVoiceActivityUserByDateRange,
  getMonthlyVoiceActiveByUser,
};
