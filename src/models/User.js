const _ = require('lodash');
const Model = require('./Model');

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
