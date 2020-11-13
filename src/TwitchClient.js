const tmi = require('tmi.js');
const options = {
  options: {
    debug: true,
    clientId: process.env.TWITCH_CLIENT_ID,
  },
  connection: {
    cluster: 'aws',
    reconnect: true,
  },
  identity: {
    username: 'ClackBot',
    password: `oauth:${process.env.TWITCH_TOKEN}`,
  },
  channels: [process.env.TWITCH_CHANNEL],
};

async function connect() {
  return new Promise((resolve, reject) => {
    const twitch = new tmi.client(options);
    twitch.connect().catch(reject);
    twitch.on('connected', (addr, port) => {
      // eslint-disable-next-line no-console
      console.log(`Twitch connected at ${addr}:${port}...`);
      resolve(twitch);
    });
  });
}

module.exports = { connect };
