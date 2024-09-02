const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['hadir', 'izin', 'sakit'],
    required: true,
  },
  keterangan: {
    type: String,
  },
  telat: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
