const User = require('../models/user');
const logger = require('../utils/logger');

const addUser = async ({ user, divisi_id }) => {
  const { id, username, createdAt } = user;
  try {
    const user = new User({ _id: id, divisi_id, username, created_at: createdAt });
    await user.save();
    return user;
  } catch (error) {
    logger.error(error, 'Error adding user');
    throw error;
  }
};

const getUserById = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    return user;
  } catch (error) {
    logger.error(error, 'Error getting user');
    throw error;
  }
};

module.exports = { addUser, getUserById };
