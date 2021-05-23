const _ = require('lodash');
const randomstring = require('randomstring');

const Model = require('./Model');
const User = require('./User');

const NoCodesLeftError = require('./NoCodesLeftError');
const AlreadyRedeemedError = require('./AlreadyRedeemedError');

class RedeemableCode extends Model {
  static get tableName() {
    return 'redeemable_codes';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        code: { type: 'string' },
        redeemedBy: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'redeemable_codes.redeemed_by',
          to: 'user.id',
        },
      },
    };
  }

  static async redeem(user) {
    const count = await RedeemableCode.query().where('redeemed_by', user.id).first();
    if (count) {
      throw new AlreadyRedeemedError();
    }

    const code = await RedeemableCode.query().whereNull('redeemed_by').first();
    if (!code) {
      throw new NoCodesLeftError();
    }
    return await code.$query().patchAndFetch({ redeemedAt: 'now', redeemedBy: user.id });
  }

  static async generate(num) {
    const codes = [];

    for (let i = 0; i < num; i++) {
      const code = randomstring.generate({ length: 20, capitalization: 'uppercase' });
      await RedeemableCode.query().insert({ code });
      codes.push(code);
    }

    return codes;
  }
}

module.exports = RedeemableCode;
