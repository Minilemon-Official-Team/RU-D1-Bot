const Admin = require('../models/admin');

const addAdmin = async (user_id) => {
  try {
    const admin = new Admin({ user_id });
    admin.save();
    return admin;
  } catch (error) {
    logger.error(error, 'Error adding admin');
    throw error;
  }
};

const getAdminByUserId = async (user_id) => {
  try {
    const admin = await Admin.findOne({ user_id });
    return admin;
  } catch (error) {
    logger.error(error, 'Error getting admin');
    throw error;
  }
};

const getAllAdmin = async () => {
  try {
    const admins = await Admin.find();
    return admins.map((admin) => admin.user_id);
  } catch (error) {
    logger.error(error, 'Error getting all admin');
    throw error;
  }
};

const deleteAdmin = async (user_id) => {
  try {
    const admin = await Admin.deleteOne({ user_id });
    return admin.deletedCount > 0;
  } catch (error) {
    logger.error(error, 'Error deleting admin');
    throw error;
  }
};

module.exports = {
  addAdmin,
  getAdminByUserId,
  getAllAdmin,
  deleteAdmin,
};
