const _ = require('lodash');

class FakeInterface {
  constructor() {
    this.calls = [];
  }

  reset() {
    this.calls = [];
    this.channel = null;
  }

  reply(channel, user, message) {
    this.calls.push({ channel, user, message });
  }

  send(channel, message) {
    this.calls.push({ channel, message });
  }

  get lastMessage() {
    return _.get(_.last(this.calls), 'message');
  }

  get lastReceiver() {
    return _.get(_.last(this.calls), 'user');
  }
}

module.exports = FakeInterface;
