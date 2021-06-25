const moment = require('moment');
const _ = require('lodash');
const { raw } = require('objection');

const Model = require('./Model');

class Setting extends Model {
  static tableName = 'settings';
  static idColumn = 'key';

  static async set(key, value) {
    return await Setting.query().insert({ key, value });
  }

  static async get(key) {
    const res = await Setting.query().findOne({ key });
    return res && res.value;
  }
}

module.exports = Setting;
