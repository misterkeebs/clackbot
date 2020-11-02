/* eslint-disable no-console */
require('dotenv').config();

const twitch = require('./src/TwitchClient');
const botServer = require('./src/BotServer');

async function main() {
  const client = await twitch.connect();
  await botServer(client);
}

main().then(() => {
  console.log('All done.');
}).catch(err => {
  console.log('Error running bot', err);
});
