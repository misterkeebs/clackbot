const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Discord connected as ${client.user.tag}`);
});

module.exports = client;
