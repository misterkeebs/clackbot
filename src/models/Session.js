/* eslint-disable no-console */
const moment = require('moment');

const Model = require('./Model');
const { randomInt } = require('../Utils');

const SUB_FACTOR = parseInt(process.env.SUB_BONUS_FACTOR || '2', 10);
const SPAWN_MIN = parseInt(process.env.CLACK_SPAWN_MIN, 10);
const SPAWN_MAX = parseInt(process.env.CLACK_SPAWN_MAX, 10);
const INTERVAL_MIN = parseInt(process.env.CLACK_INTERVAL_MIN, 10);
const INTERVAL_MAX = parseInt(process.env.CLACK_INTERVAL_MAX, 10);
const BONUS_MIN = parseInt(process.env.CLACK_BONUS_MIN, 10);
const BONUS_MAX = parseInt(process.env.CLACK_BONUS_MAX, 10);

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

  static async current() {
    const [ session ] = await Session.query()
      .where('startsAt', '<=', moment())
      .where('endsAt', '>=', moment())
      .orderBy('startsAt');
    return session;
  }

  static async last() {
    const [ session ] = await Session.query()
      .whereNotNull('processedAt')
      .where('startsAt', '<=', moment())
      .where('endsAt', '>=', moment())
      .orderBy('startsAt');
    return session;
  }

  static async pending() {
    return await Session.query().whereNull('processedAt');
  }

  static async create(immediate=false) {
    const currentSession = await Session.current();
    if (currentSession) return false;

    const pendingSessions = await Session.pending();
    if (pendingSessions) {
      console.log('Deleting pending sessions', pendingSessions);
      await Promise.all(pendingSessions.map(s => s.$query().delete()));
    }

    const duration = randomInt(INTERVAL_MIN, INTERVAL_MAX);
    const bonus = randomInt(BONUS_MIN, BONUS_MAX);
    const startDelay = immediate ? 0 : randomInt(SPAWN_MIN, SPAWN_MAX);
    const startsAt = moment().add(startDelay, 'm');
    const endsAt = moment(startsAt).add(duration, 'm');

    console.log('duration', duration);
    console.log('bonus', bonus);
    console.log('startDelay', startDelay);
    console.log('startsAt', startsAt);
    console.log('endsAt', endsAt);

    const data = { startsAt, endsAt, duration, bonus };
    // eslint-disable-next-line no-console
    console.log('Creating session', data);
    return await Session.query().insertAndFetch(data);
  }

  get timeLeft() {
    return moment(this.endsAt).diff(moment(), 'minutes');
  }

  bonusAmount(subscriber=false) {
    return this.bonus * (subscriber ? SUB_FACTOR : 1);
  }
}

module.exports = Session;
