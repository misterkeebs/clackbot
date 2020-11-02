const Model = require('./Model');

class Session extends Model {
  static get tableName() {
    return 'sessions';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        startsAt: { type: 'timestamp' },
        endsAt: { type: 'timestamp' },
        duration: { type: 'integer' },
        bonus: { type: 'integer' },
        processedAt: { type: 'timestamp' },
      },
    };
  }
}

module.exports = Session;
