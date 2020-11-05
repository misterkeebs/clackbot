const moment = require('moment');
const _ = require('lodash');

const { randomInt } = require('../Utils');

const Model = require('./Model');
const NotEnoughBonusError = require('./NotEnoughBonusError');
const NoUserError = require('./NoUserError');
const User = require('./User');
const AlreadyRaffledError = require('./AlreadyRaffledError');

class Raffle extends Model {
  static get tableName() {
    return 'raffles';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        startsAt: { type: 'timestamp' },
        endsAt: { type: 'timestamp' },
        raffledAt: { type: 'timestamp' },
        winnerId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const Player = require('./Player');

    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: Player,
        join: {
          from: 'raffles.id',
          to: 'raffle_players.raffle_id',
        },
      },
    };
  }

  static async current() {
    const [ raffle ] = await Raffle.query()
      .whereNull('raffledAt')
      .where('startsAt', '<=', moment())
      .where('endsAt', '>=', moment())
      .orderBy('startsAt');
    return raffle;
  }

  static async create(name, duration) {
    const startsAt = moment();
    const endsAt = moment(startsAt).add(duration, 'm');
    return Raffle.query().insertAndFetch({ name, startsAt, endsAt });
  }

  get timeLeft() {
    return moment(this.endsAt).diff(moment(), 'minutes');
  }

  async addPlayer(name, tickets) {
    const $playersQuery = this.$relatedQuery('players');
    const [ player ] = await $playersQuery.where('name', name);
    if (player) return;

    const [ user ] = await User.query().where('displayName', name);
    if (!user) throw new NoUserError();
    if (user.bonus < tickets) throw new NotEnoughBonusError();

    const newUser = await user.useBonus(tickets);
    await this.$relatedQuery('players').insert({ name, tickets });

    return newUser;
  }

  async run() {
    if (this.winnerId) throw new AlreadyRaffledError();

    const players = await this.$relatedQuery('players');
    const list = _.flatten(players.map(p => [...Array(p.tickets)].map(_ => p.name)));

    // eslint-disable-next-line no-console
    console.log('list', list);

    const winnerName = list[randomInt(0, list.length)];
    const winner = players.find(p => p.name === winnerName);

    // eslint-disable-next-line no-console
    console.log('The winner is', winner);

    await this.$query().patchAndFetch({ raffledAt: moment(), winnerId: winner.id });

    return winner;
  }
}

module.exports = Raffle;
