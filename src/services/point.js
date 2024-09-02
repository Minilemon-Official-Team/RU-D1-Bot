const Point = require('../models/point');
const logger = require('../utils/logger');

const addPoint = async ({ user_id, type, point, reason, added_by }) => {
  try {
    const newPoint = new Point({ user_id, type, point, reason, added_by });
    newPoint.save();
    return newPoint;
  } catch (error) {
    logger.error(error, 'Error adding point');
    throw error;
  }
};

const getPointByUserId = async ({ user_id }) => {
  try {
    const point = await Point.findOne({ user_id });
    return point;
  } catch (error) {
    logger.error(error, 'Error getting point');
    throw error;
  }
};

const deletePointByUserId = async ({ user_id }) => {
  try {
    await Point.deleteMany({ user_id });
  } catch (error) {
    logger.error(error, 'Error clearing point');
    throw error;
  }
};

const deleteAllPoints = async () => {
  try {
    await Point.deleteMany({});
  } catch (error) {
    logger.error(error, 'Error clearing point');
    throw error;
  }
};

const getMonthlyPointsByUser = async (user_id) => {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setUTCMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setUTCDate(0);
  endOfMonth.setUTCHours(23, 59, 59, 999);

  const result = await Point.aggregate([
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
        _id: '$type',
        totalPoints: { $sum: '$point' },
      },
    },
  ]);

  const addPoints = result.find((r) => r._id === 'add')?.totalPoints || 0;
  const minusPoints = result.find((r) => r._id === 'minus')?.totalPoints || 0;

  return {
    addPoints,
    minusPoints,
  };
};

module.exports = {
  addPoint,
  getPointByUserId,
  getMonthlyPointsByUser,
  deleteAllPoints,
  deletePointByUserId,
};
