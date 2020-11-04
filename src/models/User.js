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
}

module.exports = User;
