require('dotenv').config();

module.exports = {
  TOKEN: process.env.TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  CLIENT_ID: process.env.CLIENT_ID,
  MONGODB_URI: process.env.MONGODB_URI,
  AUTHOR_ID: process.env.AUTHOR_ID,
  PREFIX: '#',
};
