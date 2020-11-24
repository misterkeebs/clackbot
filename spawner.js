/* eslint-disable no-console */
require('dotenv').config();

const twitch = require('./src/TwitchClient');
const ClackSpawner = require('./src/ClackSpawner');
const discord = require('./src/DiscordClient');

const sleep = process.env.SLEEP_BETWEEN_SPAWNS || 30;

function connect() {
  return new Promise((resolve, reject) => {
    discord.login(process.env.DISCORD_TOKEN);
    discord.on('ready', () => {
      resolve(discord);
    });
    discord.on('error', err => {
      console.error('Error connecting to Discord', err);
    });
  });
}

let client, discordClient, spawner;

async function init() {
  console.log('Initializing...');
  client = await twitch.connect();
  discordClient = await connect();
  spawner = new ClackSpawner(client, discordClient);
}

async function main() {
  await spawner.check();
}

function run() {
  console.log('Running spawner...');
  main().then(_ => {
    console.log(`All done, waiting ${sleep}s before next run...\n`);
  }).catch(err => {
    console.error('Error', err);
  }).finally(_ => {
    setTimeout(run, sleep * 1000);
  });
}

init()
  .then(_ => run())
  .catch(err => console.error('Error initializing', err));
