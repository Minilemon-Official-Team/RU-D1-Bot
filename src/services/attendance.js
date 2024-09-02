const Attendance = require('../models/attendance');
const logger = require('../utils/logger');

const addAttendance = async ({ user_id, status, keterangan, telat }) => {
  try {
    const attendance = new Attendance({ user_id, status, keterangan, telat });
    await attendance.save();
    return attendance;
  } catch (error) {
    logger.error(error, 'Error adding attendance');
    throw error;
  }
};

const getAttendanceByUserAndDate = async (user_id, date) => {
  try {
    const attendance = await Attendance.findOne({ user_id, date });
    return attendance;
  } catch (error) {
    logger.error(error, 'Error getting attendance');
    throw error;
  }
};

const getAttendanceByUserAndDateRange = async ({ user_id, startDate, endDate }) => {
  try {
    const attendance = await Attendance.find({
      user_id: user_id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    return attendance;
  } catch (error) {
    logger.error(error, 'Error getting attendance by date range');
    throw error;
  }
};

const getAllAttendancesByUser = async (user_id) => {
  try {
    const attendances = await Attendance.find({ user_id }).sort({ date: -1 });
    return attendances;
  } catch (error) {
    logger.error(error, 'Error getting all attendances by user');
    throw error;
  }
};

const deleteAttendanceByUserAndDate = async (user_id, date) => {
  try {
    const result = await Attendance.deleteOne({ user_id, date });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(error, 'Error deleting attendance');
    throw error;
  }
};

module.exports = {
  addAttendance,
  getAttendanceByUserAndDate,
  getAllAttendancesByUser,
  deleteAttendanceByUserAndDate,
  getAttendanceByUserAndDateRange,
};
