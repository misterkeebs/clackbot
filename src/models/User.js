const _ = require('lodash');
const moment = require('moment');

const Model = require('./Model');
const { weighedRandom } = require('../Utils');

const DONATION_RATE = process.env.DONATION_RATE || 0.5;
const KICKBACK_UNIT = process.env.KICKBACK_UNIT || 5;

const NotEnoughBonusError = require('./NotEnoughBonusError');
const AlreadyRedeemedError = require('./AlreadyRedeemedError');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        discordId: { type: 'string' },
        displayName: { type: 'string' },
        bonus: { type: 'integer' },
        sols: { type: 'integer' },
        lastSessionId: { type: 'integer' },
        discordWannabe: { type: 'string' },
        twitchWannabe: { type: 'string' },
        linkedAt: { type: 'datetime' },
      },
    };
  }

  static get relationMappings() {
    const RedeemableCode = require('./RedeemableCode');

    return {
      redeemedCodes: {
        relation: Model.HasManyRelation,
        modelClass: RedeemableCode,
        join: {
          from: 'user.id',
          to: 'redeemable_code.redeemed_by',
        },
      },
    };
  }

  static async find(identifier) {
    if (identifier.startsWith('<@!')) {
      const id = identifier.substring(3, identifier.length - 1);
      const discordUser = await this.query().where('discord_id', id).first();
      if (discordUser) return discordUser;
    }
    return this.query().where('display_name', identifier).first();
  }

  static async fromDiscordMessage(msg) {
    return User.query().where('discordId', msg.author.id).first();
  }

  async useBonus(amount) {
    return this.$query().patchAndFetch({ bonus: this.bonus - amount });
  }

  async addFromSession(session, subscriber = false) {
    const amount = session.bonusAmount(subscriber);
    const bonus = this.bonus + amount;
    const sols = this.sols + amount;
    return this.$query().patchAndFetch({ bonus, sols, lastSessionId: session.id });
  }

  async donate(amount, receiver) {
    if (this.sols < amount) throw new NotEnoughBonusError();

    const bonus = Math.ceil(amount * DONATION_RATE);
    let kickbackAmount = 0;
    if (amount >= KICKBACK_UNIT) {
      kickbackAmount = User.weighedRandom([0, 0, 0,
        Math.round(amount * (KICKBACK_UNIT * 0.5)),
        Math.round(amount * (KICKBACK_UNIT * 1)),
        Math.round(amount * (KICKBACK_UNIT * 1.5))]);
    }
    await this.$query().patch({ sols: this.sols - amount, bonus: this.bonus + kickbackAmount });
    await receiver.$query().patch({ bonus: receiver.bonus + bonus });
    return { bonus, kickbackAmount };
  }

  async redeem(amount) {
    if (this.bonus < amount) throw new NotEnoughBonusError();

    const RedeemableCode = require('./RedeemableCode');
    const codeObj = await RedeemableCode.redeem(this);

    const user = await this.$query().patchAndFetch({ bonus: this.bonus - amount });
    return { bonus: user.bonus, code: codeObj.code };
  }

  async addBonus(bonus) {
    if (bonus === 0) return;
    return this.$query().patch({ bonus: this.bonus + bonus });
  }

  static async addBonus(displayName, bonus) {
    let [user] = await User.query().where('displayName', displayName);
    if (!user) {
      user = await User.query().insertAndFetch({ displayName, bonus: 0 });
    }
    return await user.$query().patchAndFetch({ bonus: user.bonus + bonus });
  }

  static async createFromSession(displayName, session, subscriber = false) {
    const amount = session.bonusAmount(subscriber);
    return User.query().insertAndFetch({
      displayName,
      bonus: amount,
      sols: amount,
      lastSessionId: session.id,
    });
  }

  static async updateOrCreate(displayName, attrs) {
    const [user] = await User.query().where('displayName', displayName);
    if (_.isEmpty(attrs)) return user;
    if (user) return user.$query().patchAndFetch(attrs);

    return User.query().insertAndFetch({ displayName, ...attrs });
  }

  static async leaders() {
    return await this.query()
      .limit(10)
      .whereNotNull('bonus')
      .whereNotNull('discordWannabe')
      .orderByRaw('bonus DESC NULLS LAST, sols DESC NULLS LAST');
  }

  async daily() {
    if (this.lastDailyAt) {
      const nextClaim = moment(this.lastDailyAt).add(11, 'hours');

      if (nextClaim.isAfter(moment())) {
        throw new AlreadyRedeemedError(nextClaim);
      }
    }

    const sols = weighedRandom([1, 2, 3, 4, 5, 6]);
    const bonus = weighedRandom([0, 0, 0, 1, 3, 5]);

    await this.$query().patch({
      bonus: _.get(this, 'bonus', 0) + bonus,
      sols: _.get(this, 'sols', 0) + sols,
      lastDailyAt: 'now',
    });

    return { sols, bonus };
  }

  async saveState(action, state, data) {
    const stateData = { action, state, data };
    return await this.$query().patchAndFetch({ state: stateData });
  }

  async restoreState() {
    const StateManager = require('../StateManager');
    return StateManager.createAction(this);
  }
}
User.weighedRandom = weighedRandom;

module.exports = User;
