/* eslint-disable no-console */
require('dotenv').config();

const twitch = require('./src/TwitchClient');
const ClackSpawner = require('./src/ClackSpawner');

const sleep = process.env.SLEEP_BETWEEN_SPAWNS || 30;

async function main() {
  const client = await twitch.connect();
  const spawner = new ClackSpawner(client);
  await spawner.check();
}

function run() {
  console.log('Starting spawner...');
  main().then(_ => {
    console.log(`All done, waiting ${sleep}s before next run...\n`);
  }).catch(err => {
    console.error('Error', err);
  }).finally(_ => {
    setTimeout(run, sleep * 1000);
  });
}

run();
