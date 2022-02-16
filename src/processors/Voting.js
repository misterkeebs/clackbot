const _ = require('lodash');
const RestrictedProcessor = require('./RestrictedProcessor');

class Voting extends RestrictedProcessor {
  constructor(channels) {
    super('VOTING', channels);
  }

  async process(msg) {
    this.upReaction = await msg.react('🔼');
    this.downReaction = await msg.react('🔽');
  }

  async handleReaction(reaction, user) {
    if (user.id === process.env.DISCORD_CLIENT_ID) return;

    const isUp = reaction === this.upReaction;
    const isDown = reaction === this.downReaction;

    if (!isUp && !isDown) return;

    const targetReaction = isUp ? this.downReaction : this.upReaction;
    if (!targetReaction) return;
    const found = targetReaction.users.resolve(user.id);
    if (found) {
      targetReaction.users.remove(user);
    }
  }
}

module.exports = Voting;
