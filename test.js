require('dotenv').config();
const moment = require('moment');
const Discord = require('discord.js');
const TwitchApi = require('./src/TwitchApi');
const twitch = require('./src/TwitchClient');
const discord = require('./src/DiscordClient');
const GroupBuy = require('./src/models/GroupBuy');
const GroupBuyNotifier = require('./src/tasks/GroupBuyNotifier');
const VotingCloser = require('./src/tasks/VotingCloser');
const Setting = require('./src/models/Setting');
const Voting = require('./src/processors/Voting');

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

  const channel = client.channels.cache.find(c => c.name === 'banner-pics');
  const msg1 = await channel.send('*** INITIAL ***');
  const msg2 = await channel.send('test 1', new Discord.MessageAttachment('https://i.pinimg.com/originals/9c/2b/4f/9c2b4f515aa311691296757e398e894b.jpg', 'kb2.jpg'));
  await msg2.react(Voting.UPVOTE);
  const msg3 = await channel.send('test 2', new Discord.MessageAttachment('https://i.pinimg.com/originals/be/55/95/be5595fdf9b8ce2f657471659d53de13.jpg', 'elongate.gif'));
  await msg3.react(Voting.DOWNVOTE);

  Setting.set('voting-last-draw-banner-pics', msg1.id);

  const task = new VotingCloser(client);
  await task.run();
}

main().then(x => {
  console.log('Finished with', x);
}).catch(err => {
  console.error('Error', err);
});
