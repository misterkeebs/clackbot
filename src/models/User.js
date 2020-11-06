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
        displayName: { type: 'string' },
        bonus: { type: 'integer' },
        lastSessionId: { type: 'integer'},
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
}

module.exports = User;
