const tmi = require('tmi.js');
const BotInterface = require('../BotInterface');

const options = {
  options: {
    debug: true,
  },
  connection: {
    cluster: 'aws',
    reconnect: true,
  },
  identity: {
    username: 'ClackBot',
    password: 'oauth:u7zitw49zuish6pl8g1nkndumojqcv',
  },
  channels: ['srteclados'],
};

const client = new tmi.client(options);

class TwitchInterface extends BotInterface {
  async startConnection() {
    const res = client.connect();
    client.on('connected', (addr, port) => {
      // eslint-disable-next-line no-console
      console.log(`Twitch connected at ${addr}:${port}...`);
    });
    client.on('chat', (channel, userData, message, _self) => {
      // console.log('userData', userData);
      const user = userData['display-name'];
      this.bot.handleMessage(this, channel, user, message);
    });
    return res;
  }

  reply(channel, user, message) {
    client.action(channel, `${user} ${message}`);
  }
}

module.exports = TwitchInterface;
