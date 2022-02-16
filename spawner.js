/* eslint-disable no-console */
require('dotenv').config();

const twitch = require('./src/TwitchClient');
const ClackSpawner = require('./src/ClackSpawner');
const discord = require('./src/DiscordClient');
const GroupBuyNotifier = require('./src/tasks/GroupBuyNotifier');
const VotingCloser = require('./src/tasks/VotingCloser');

const sleep = process.env.SLEEP_BETWEEN_SPAWNS || 30;

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

let client, discordClient, spawner, notifier;

async function init() {
  console.log('Initializing...');
  client = await twitch.connect();
  discordClient = await connect();
  spawner = new ClackSpawner(client, discordClient);
  notifier = new GroupBuyNotifier(client, discordClient);
}

async function main() {
  await spawner.check();
  await notifier.execute();
  await new VotingCloser().start();
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
