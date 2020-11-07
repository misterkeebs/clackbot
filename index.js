/* eslint-disable no-console */
require('dotenv').config();
const socketIO = require('socket.io');

const twitch = require('./src/TwitchClient');
const discord = require('./src/DiscordClient');

const botServer = require('./src/BotServer');
const webServer = require('./src/WebServer');
const webSocket = require('./src/WebSocket');

async function main() {
  const client = await twitch.connect();
  discord.login(process.env.DISCORD_TOKEN);

  const port = process.env.PORT || 5000;
  const server = webServer.listen(port, () => console.log(`API running on port ${port}`));
  webServer.io = socketIO(server);
  await webSocket(webServer.io);

  await botServer(client, discord);
}

main().then(() => {
  console.log('All done.');
}).catch(err => {
  console.log('Error running bot', err);
});
