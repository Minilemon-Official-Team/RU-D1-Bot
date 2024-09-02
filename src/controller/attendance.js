const attendanceService = require('../services/attendance');
const { DateTime } = require('luxon');
const { ensureUserExists } = require('./user');
const logger = require('../utils/logger');

const addAttendance = async ({ member, status, keterangan = null }) => {
  const {
    user: { id: user_id },
  } = member;
  await ensureUserExists(member);

  const wajibKeterangan = ['izin', 'sakit'];

  if (wajibKeterangan.includes(status) && !keterangan) {
    throw new Error(`Gagal absen: \`keterangan ${status} wajib di isi\``);
  }

  const startAbsen = new Date().setHours(8, 45, 0, 0);
  const endAbsen = new Date().setHours(9, 10, 0, 0);
  const now = new Date();

  const telat = !(now >= startAbsen && now <= endAbsen);

  try {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const existingAttendance = await attendanceService.getAttendanceByUserAndDateRange({
      user_id,
      startDate,
      endDate,
    });

    if (existingAttendance.length > 0) {
      const timestamp = Math.floor(new Date(existingAttendance[0].date).getTime() / 1000);
      throw new Error(
        `Anda sudah tercatat **${existingAttendance[0].status}** hari ini pada jam <t:${timestamp}:t>. Terima kasih.`,
      );
    }

    const newAttendance = await attendanceService.addAttendance({
      user_id,
      status,
      keterangan,
      telat,
    });

    return {
      attendance: newAttendance,
      timestamp: Math.floor(
        DateTime.fromISO(new Date(newAttendance.date).toISOString(), {
          zone: 'utc',
        }).toSeconds(),
      ),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getWeeklyAttendanceStatus = async (userId) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const weeklyAttendance = await attendanceService.getAttendanceByUserAndDateRange({
      user_id: userId,
      startDate: startOfWeek,
      endDate: endOfWeek,
    });

    const totalAttendance = weeklyAttendance.length;
    const lateCount = weeklyAttendance.filter((a) => a.telat).length;

    if (totalAttendance === 0) {
      return 'N/A';
    }

    if (totalAttendance >= 5 && lateCount === 0) {
      return 'Very Well';
    } else if (totalAttendance >= 4 && lateCount <= 2) {
      return 'Good';
    } else {
      return 'Very Bad';
    }
  } catch (error) {
    logger.error(error, 'Error getting weekly attendance status');
    throw error;
  }
};

const getMonthlyAttendanceStatus = async (userId) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
    endOfMonth.setUTCDate(0);
    endOfMonth.setUTCHours(23, 59, 59, 999);

    const monthlyAttendance = await attendanceService.getAttendanceByUserAndDateRange({
      user_id: userId,
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    const totalAttendance = monthlyAttendance.length;
    const lateCount = monthlyAttendance.filter((a) => a.telat).length;

    if (totalAttendance === 0) {
      return 'N/A';
    }

    if (totalAttendance >= 20 && lateCount <= 2) {
      return 'Very Well';
    } else if (totalAttendance >= 15 && lateCount <= 5) {
      return 'Good';
    } else {
      return 'Very Bad';
    }
  } catch (error) {
    logger.error(error, 'Error getting monthly attendance status');
    throw error;
  }
};

module.exports = {
  addAttendance,
  getWeeklyAttendanceStatus,
  getMonthlyAttendanceStatus,
};
