const Model = require('./Model');

class GroupBuy extends Model {
  static get tableName() {
    return 'groupbuys';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        url: { type: 'string' },
        startsAt: { type: 'datetime' },
        endsAt: { type: 'datetime' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
        createdBy: { type: 'string' },
        updatedBy: { type: 'string' },
      },
    };
  }
}

module.exports = GroupBuy;
