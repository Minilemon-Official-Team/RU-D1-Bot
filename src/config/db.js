const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/config');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    logger.info(`Database Connected: ${conn.connection.name}`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = connectDB;
