const _ = require('lodash');
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
    const count = await RedeemableCode.query().where('redeemed_by', user.id).count();
    if (count > 0) {
      throw new AlreadyRedeemedError();
    }

    const code = await RedeemableCode.query().whereNull('redeemed_by').first();
    console.log('code', code);
    if (!code) {
      throw new NoCodesLeftError();
    }
    return await code.$query().patchAndFetch({ redeemedAt: 'now', redeemedBy: user.id });
  }
}

module.exports = RedeemableCode;
