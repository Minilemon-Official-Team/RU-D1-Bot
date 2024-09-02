const { GUILD_ID } = require('../config/config');
const userService = require('../services/user');
const { ensureDivisionExists } = require('./division');

const ensureUserExists = async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  const { id } = member.user;
  const division = member.roles.highest;

  try {
    const userExists = await userService.getUserById(id);
    if (!userExists) {
      await ensureDivisionExists(division);
      await userService.addUser({ user: member.user, divisi_id: division.id });
    }
  } catch (error) {
    console.error('Error ensuring user existence:', error);
    throw error;
  }
};

module.exports = { ensureUserExists };
