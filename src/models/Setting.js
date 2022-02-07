const moment = require('moment');
const _ = require('lodash');
const { raw } = require('objection');

const Model = require('./Model');

class Setting extends Model {
  static tableName = 'settings';
  static idColumn = 'key';

  static async set(key, value) {
    const res = await Setting.query().update({ value }).where({ key });
    if (res === 0) {
      return await Setting.query().insert({ key, value });
    }
    return res;
  }

  static async get(key, defaultValue) {
    const res = await Setting.query().findOne({ key });
    return (res && res.value) || defaultValue;
  }
}

module.exports = Setting;
