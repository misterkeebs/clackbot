const _ = require('lodash');
const Model = require('./Model');

const DONATION_RATE = process.env.DONATION_RATE || 0.5;

const NotEnoughBonusError = require('./NotEnoughBonusError');

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
        lastSessionId: { type: 'integer'},
        discordWannabe: { type: 'string' },
        twitchWannabe: { type: 'string' },
        linkedAt: { type: 'datetime' },
      },
    };
  }

  async useBonus(amount) {
    return this.$query().patchAndFetch({ bonus: this.bonus - amount });
  }

  async addFromSession(session, subscriber=false) {
    const bonus = this.bonus + session.bonusAmount(subscriber);
    return this.$query().patchAndFetch({ bonus, lastSessionId: session.id });
  }

  async donate(amount, receiver) {
    if (this.sols < amount) throw new NotEnoughBonusError();

    const bonus = Math.ceil(amount * DONATION_RATE);
    await this.$query().patch({ sols: this.sols - amount });
    await receiver.$query().patch({ bonus: receiver.bonus + bonus });
    return bonus;
  }

  static async addBonus(displayName, bonus) {
    let [ user ] = await User.query().where('displayName', displayName);
    if (!user) {
      user = await User.query().insertAndFetch({ displayName, bonus: 0 });
    }
    return await user.$query().patchAndFetch({ bonus: user.bonus + bonus });
  }

  static async createFromSession(displayName, session, subscriber=false) {
    const bonus = session.bonusAmount(subscriber);
    return User.query().insertAndFetch({ displayName, bonus, lastSessionId: session.id });
  }

  static async updateOrCreate(displayName, attrs) {
    const [ user ] = await User.query().where('displayName', displayName);
    if (_.isEmpty(attrs)) return user;
    if (user) return user.$query().patchAndFetch(attrs);

    return User.query().insertAndFetch({ displayName, ...attrs });
  }
}

module.exports = User;
