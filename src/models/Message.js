const Model = require('./Model');

class Message extends Model {
  static get tableName() {
    return 'messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        key: { type: 'string' },
        value: { type: 'string' },
      },
    };
  }
}

module.exports = Message;
