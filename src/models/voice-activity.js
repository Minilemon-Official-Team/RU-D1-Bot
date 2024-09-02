const mongoose = require('mongoose');

const voiceActivitySchema = mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  active_hours: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const VoiceActivity = mongoose.model('VoiceActivity', voiceActivitySchema);

module.exports = VoiceActivity;
