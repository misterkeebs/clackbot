class ChannelMessagesCache {
  constructor(channel) {
    this.channel = channel;
  }

  get(id) {
    return this.channel.channelMessages.find(m => m.id === id);
  }
}

class Channel {
  constructor(name) {
    this.id = 'id' + performance.now();
    this.name = name;
    this.channelMessages = [];
    this.messages = {
      fetch: () => Promise.resolve(this.channelMessages),
      cache: new ChannelMessagesCache(this),
    };
  }

  reset() {
    this.channelMessages = [];
  }

  async send(content, args = {}) {
    const Message = require('./Message');
    args.channel = this;
    const msg = new Message(content, args);
    this.addMessage(msg);
    return Promise.resolve(msg);
  }

  addMessage(msg) {
    this.channelMessages.push(msg);
  }
}

module.exports = Channel;
