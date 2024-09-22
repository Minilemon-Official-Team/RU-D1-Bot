require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.cooldowns = new Collection();

require('./handlers/commandHandler')(client);
require('./handlers/buttonHandler')(client);
require('./handlers/eventHandler')(client);
require('./handlers/prefixHandler')(client);

client.login(process.env.TOKEN);
