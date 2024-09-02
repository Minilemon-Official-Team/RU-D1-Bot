const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    divisi_id: {
      type: String,
      ref: 'Division',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
