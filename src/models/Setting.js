const moment = require('moment');
const _ = require('lodash');
const { raw } = require('objection');

const Model = require('./Model');

class Setting extends Model {
  static tableName = 'settings';
  static idColumn = 'key';

  static async set(key, value) {
    const res = await Setting.query().update({ key, value });
    if (res === 0) {
      return await Setting.query().insert({ key, value });
    }
    return res;
  }

  static async get(key) {
    const res = await Setting.query().findOne({ key });
    return res && res.value;
  }
}

module.exports = Setting;
