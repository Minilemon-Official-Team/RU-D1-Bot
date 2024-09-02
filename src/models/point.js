const mongoose = require('mongoose');

const pointSchema = mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['add', 'minus'],
    required: true,
  },
  point: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: null,
  },
  added_by: {
    type: String,
    ref: 'User',
    default: null,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Point = mongoose.model('Point', pointSchema);

module.exports = Point;
