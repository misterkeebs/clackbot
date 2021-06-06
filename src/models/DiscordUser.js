const _ = require('lodash');
const moment = require('moment');

const Model = require('./Model');

class DiscordUser extends Model {
  static get tableName() {
    return 'discord_users';
  }
}

module.exports = DiscordUser;
