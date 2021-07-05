const _ = require('lodash');

class FakeInterface {
  constructor(opts) {
    this.calls = [];
    this.channelMessages = [];
    this.rawMessage = {
      channel: {
        send: (message, embed) => {
          this.channelMessages.push({ message, embed });
        }
      },
    };
  }

  reset() {
    this.calls = [];
    this.channel = null;
  }

  reply(channel, user, message) {
    this.calls.push({ channel, user, message });
  }

  findChannelMessage(msg) {
    return _.find(this.channelMessages, { message: msg });
  }

  get lastChannelMessage() {
    return _.get(_.last(this.channelMessages), 'message');
  }

  get lastMessage() {
    return _.get(_.last(this.calls), 'message');
  }

  get lastReceiver() {
    return _.get(_.last(this.calls), 'user');
  }
}

module.exports = FakeInterface;
