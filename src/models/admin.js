const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
