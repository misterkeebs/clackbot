const _ = require('lodash');
const { hasAnyDiscordRole } = require('../Utils');

class RestrictedProcessor {
  constructor(prefix, channels) {
    this.channels = (channels || _.get(process.env, `${prefix}_CHANNELS`, '')).split(',');
    this.allowedRoles = _.get(process.env, `${prefix}_ALLOW_ROLES`, '').split(',');
  }

  async handle(msg) {
    if (!msg.channel || !this.channels.includes(msg.channel.name)) return false;
    if (hasAnyDiscordRole(msg, this.allowedRoles)) return false;

    return await this.process(msg);
  }
}

module.exports = RestrictedProcessor;

