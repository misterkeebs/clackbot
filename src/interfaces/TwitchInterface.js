class TwitchInterface {
  constructor(bot, client) {
    this.bot = bot;
    this.client = client;

    this.client.on('chat', (channel, userData, message, _self) => {
      // console.log('userData', userData);
      const user = userData['display-name'];
      this.bot.handleMessage(this, channel, user, message);
    });
  }

  send(channel, message) {
    this.client.action(channel, message);
  }

  reply(channel, user, message) {
    this.client.action(channel, `${user} ${message}`);
  }
}

module.exports = TwitchInterface;
