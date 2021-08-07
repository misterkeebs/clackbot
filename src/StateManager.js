const BuySellAction = require('./actions/BuySellAction');
const User = require('./models/User');

const ACTIONS = {
  buySell: BuySellAction,
};

class StateManager {
  static async startAction(actionName, msg) {
    const user = await User.fromDiscordMessage(msg);
    const cls = ACTIONS[actionName];
    const action = new cls(user);
    if (action) return await action.run(msg);
    return Promise.resolve();
  }

  static createAction(user) {
    const { action, state, data } = user.state || {};

    const cls = ACTIONS[action];
    if (!cls) return;

    return new cls(user, state, data);
  }
}

module.exports = StateManager;
