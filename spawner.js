/* eslint-disable no-console */
require('dotenv').config();

const twitch = require('./src/TwitchClient');
const ClackSpawner = require('./src/ClackSpawner');

async function main() {
  const client = await twitch.connect();
  const spawner = new ClackSpawner(client);
  await spawner.check();
}

main().then(_ => {
  console.log('All done.');
  process.exit(0);
}).catch(err => {
  console.error('Error', err);
  process.exit(1);
});
