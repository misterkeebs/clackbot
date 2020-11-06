const _ = require('lodash');

class FakeInterface {
  constructor() {
    this.calls = [];
  }

  reset() {
    this.calls = [];
  }

  reply(channel, user, message) {
    this.calls.push({ channel, user, message });
  }

  get lastMessage() {
    return _.get(this.calls, 0, {}).message;
  }
}

module.exports = FakeInterface;
