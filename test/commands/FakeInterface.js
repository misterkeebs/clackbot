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

  get lastMessage() {
    return _.get(_.last(this.calls), 'message');
  }
}

module.exports = FakeInterface;
