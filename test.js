require('dotenv').config();
const moment = require('moment');
const Discord = require('discord.js');
const TwitchApi = require('./src/TwitchApi');
const twitch = require('./src/TwitchClient');
const discord = require('./src/DiscordClient');
const GroupBuy = require('./src/models/GroupBuy');
const GroupBuyNotifier = require('./src/tasks/GroupBuyNotifier');
const VotingCloser = require('./src/tasks/VotingCloser');

function connect() {
  return new Promise((resolve, reject) => {
    discord.login(process.env.DISCORD_TOKEN);
    discord.on('ready', () => {
      resolve(discord);
    });
    discord.on('error', err => {
      console.error('Error connecting to Discord', err);
      reject(err);
    });
  });
}

async function main() {
  const client = await connect();

  const task = new VotingCloser(client);
  await task.run();
}

main().then(x => {
  console.log('Finished with', x);
}).catch(err => {
  console.error('Error', err);
});
