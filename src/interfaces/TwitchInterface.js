const Promise = require('bluebird');

const Wpm = require('../processors/Wpm');

const PROCESSORS = [
  new Wpm(),
];


class TwitchInterface {
  constructor(bot, client) {
    this.bot = bot;
    this.client = client;
    this.name = 'twitch';

    this.client.on('chat', async (channel, userData, message, _self) => {
      console.log('userData', userData);
      const user = userData['display-name'];
      const processed = await this.preProcess(this.client, user, message);
      console.log('processed', processed);
      if (processed) return;
      await this.bot.handleMessage(this, { channel, user, message, userData });
    });
  }

  async reply(channel, user, message) {
    this.client.action(channel, `${user} ${message}`);
  }

  async send(channel, message) {
    this.client.action(channel, message);
  }

  async preProcess(client, userData, msg) {
    let resolved = false;
    const result = await Promise.map(PROCESSORS, async proc => {
      if (resolved) return Promise.resolve();
      const res = await proc.handle(this, client, userData, msg);
      if (res) resolved = true;
      return res;
    });
    return result.find(r => !!r);
  }
}

module.exports = TwitchInterface;
