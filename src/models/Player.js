const Model = require('./Model');

class Player extends Model {
  static get tableName() {
    return 'raffle_players';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        raffleId: { type: 'integer' },
        nick: { type: 'string' },
        joinedAt: { type: 'timestamp' },
        tickets: { type: 'integer' },
        winner: { type: 'boolean' },
      },
    };
  }

  static get relationMappings() {
    const Raffle = require('./Raffle');

    return {
      raffle: {
        relation: Model.BelongsToOneRelation,
        modelClass: Raffle,
        join: {
          from: 'raffle_players.raffle_id',
          to: 'raffle.id',
        },
      },
    };
  }

  $beforeInsert() {
    this.joined_at = new Date().toISOString();
  }
}

module.exports = Player;
