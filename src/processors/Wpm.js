const _ = require('lodash');

const Guesses = require('../commands/Guesses');
const guesses = Guesses.getInstance();

class Wpm {
  async handle(iface, client, user, msg) {
    if (!guesses.tracking) return false;
    if (!msg.trim().match(/^\d{1,3}$/)) return false;

    const wpm = parseInt(msg.trim(), 10);
    guesses.add(user, wpm);
    return true;
  }
}

module.exports = Wpm;

