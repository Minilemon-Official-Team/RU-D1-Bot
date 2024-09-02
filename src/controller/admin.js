const admin = require('../services/admin');

const addAdmin = async (user_id) => {
  const adminExists = await admin.getAdminByUserId(user_id);

  if (adminExists) {
    throw new Error(`Admin <@${adminExists.user_id}> sudah terdaftar!`);
  }

  const newAdmin = await admin.addAdmin(user_id);
  return newAdmin;
};

const deleteAdmin = async (user_id) => {
  const adminExists = await admin.getAdminByUserId(user_id);

  if (!adminExists) {
    throw new Error(`Admin <@${adminExists.user_id}> tidak terdaftar!`);
  }

  const isAdminDeleted = await admin.deleteAdmin(user_id);
  return isAdminDeleted;
};

module.exports = { addAdmin, deleteAdmin };
