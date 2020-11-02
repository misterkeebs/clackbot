class TwitchInterface {
  constructor(bot, client) {
    this.bot = bot;
    this.client = client;
    this.mods = [];

    this.client.on('chat', async (channel, userData, message, _self) => {
      console.log('userData', userData);
      const user = userData['display-name'];
      await this.bot.handleMessage(this, { channel, user, message, userData });
    });
  }

  reply(channel, user, message) {
    this.client.action(channel, `${user} ${message}`);
  }
}

module.exports = TwitchInterface;
