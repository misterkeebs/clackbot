class Discord {
  constructor(channelNames = ['canal']) {
    const Channel = require('./Channel');
    this.channels = {
      cache: channelNames.map(n => new Channel(n))
    };
  }

  reset() {
    this.channels.cache.forEach(c => c.reset());
  }

  async sendMessage(channelName, content, attachments) {
    const Message = require('./Message');
    const channel = this.channels.cache.find(c => c.name === channelName);
    return await channel.send(content, attachments);
  }

  getChannel(channelName) {
    const channels = this.channels.cache;
    const channel = channels.length > 1
      ? channels.find(c => c.name === channelName)
      : channels[0];
    return channel;
  }

  getChannelMessages(channelName) {
    return this.getChannel(channelName).channelMessages;
  }

  getLastMessage(channelName) {
    const msgs = this.getChannelMessages(channelName);
    return msgs[msgs.length - 1];
  }
}

module.exports = Discord;
