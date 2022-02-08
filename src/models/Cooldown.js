const moment = require('moment');
const Setting = require('./Setting');

class Cooldown {
  static async for(module, duration) {
    const key = `cooldown-${module}`;
    const lastUsed = await Setting.get(key);

    if (!lastUsed) {
      await Setting.set(key, moment().toDate());
      return true;
    }

    const secondsSince = moment().diff(lastUsed, 'seconds');
    if (secondsSince > duration * 60) {
      await Setting.set(key, moment().toDate());
      return true;
    }

    return false;
  }
};

module.exports = Cooldown;
