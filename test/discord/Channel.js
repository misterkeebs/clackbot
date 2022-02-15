class Channel {
  constructor(name) {
    this.id = 'id' + performance.now();
    this.name = name;
    this.channelMessages = [];
    this.messages = {
      fetch: () => Promise.resolve(this.channelMessages),
    };
  }

  reset() {
    this.channelMessages = [];
  }

  async send(content, attachments) {
    const Message = require('./Message');
    const msg = new Message(content, { channel: this, attachments });
    this.channelMessages.push(msg);
    return Promise.resolve(msg);
  }
}

module.exports = Channel;
