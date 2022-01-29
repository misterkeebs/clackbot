const _ = require('lodash');
const moment = require('moment');

const Model = require('./Model');

class UserLastMessage extends Model {
  static get tableName() {
    return 'users_last_messages';
  }

  static async getFor(discordId, channelName) {
    return await UserLastMessage.query().findOne({ discordId, channelName });
  }

  static async for(discordId, channelName) {
    const res = await UserLastMessage.getFor(discordId, channelName);
    return res && res.lastMessageAt;
  }

  static async track(discordId, channelName) {
    const instance = await UserLastMessage.getFor(discordId, channelName);
    if (instance) {
      return await instance.$query().patchAndFetch({ lastMessageAt: moment() });
    }
    return await UserLastMessage.query().insertAndFetch({ discordId, channelName });
  }

  $beforeInsert() {
    if (!this.lastMessageAt) {
      this.last_message_at = new Date().toISOString();
    }
  }
}

module.exports = UserLastMessage;
