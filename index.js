/* eslint-disable no-console */
require('dotenv').config();
const socketIO = require('socket.io');

const twitch = require('./src/TwitchClient');
const botServer = require('./src/BotServer');
const webServer = require('./src/WebServer');

async function main() {
  const port = process.env.PORT || 5000;
  const server = webServer.listen(port, () => console.log(`API running on port ${port}`));
  webServer.io = socketIO(server);

  const client = await twitch.connect();
  await botServer(client);
}

main().then(() => {
  console.log('All done.');
}).catch(err => {
  console.log('Error running bot', err);
});
