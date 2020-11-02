/* eslint-disable no-console */
const moment = require('moment');

const SPAWN_MIN = parseInt(process.env.CLACK_SPAWN_MIN, 10);
const SPAWN_MAX = parseInt(process.env.CLACK_SPAWN_MAX, 10);
const INTERVAL_MIN = parseInt(process.env.CLACK_INTERVAL_MIN, 10);
const INTERVAL_MAX = parseInt(process.env.CLACK_INTERVAL_MAX, 10);
const BONUS_MIN = parseInt(process.env.CLACK_BONUS_MIN, 10);
const BONUS_MAX = parseInt(process.env.CLACK_BONUS_MAX, 10);

const TwitchApi = require('./TwitchApi');
const { randomInt } = require('./Utils');

const channelName = process.env.TWITCH_CHANNEL;
const twitch = new TwitchApi();

const Session = require('./models/Session');

class ClackSpawner {
  constructor(client) {
    this.client = client;
  }

  async createSession() {
    const duration = randomInt(INTERVAL_MIN, INTERVAL_MAX);
    const bonus = randomInt(BONUS_MIN, BONUS_MAX);
    const startDelay = randomInt(SPAWN_MIN, SPAWN_MAX);
    const startsAt = moment().add(startDelay, 'm');
    const endsAt = moment(startsAt).add(duration, 'm');

    const data = { startsAt, endsAt, duration, bonus };
    console.log('Creating session', data);
    return await Session.query().insertAndFetch(data);
  }

  async check() {
    const channel = await twitch.getCurrentStream(channelName);

    // if (!channel) {
    //   console.log(channelName, 'is not streaming, skipping.');
    //   return;
    // }

    // finds current sessions
    const now = moment();
    const pendingSessions = await Session.query()
      .whereNull('processedAt')
      .orderBy('startsAt');

    console.log('Pending sessions', pendingSessions.length);

    if (!pendingSessions.length) {
      await this.createSession();
      return;
    }

    const currentSessions = await Session.query()
      .where('startsAt', '<=', now)
      .where('endsAt', '>=', now)
      .whereNull('processedAt')
      .orderBy('startsAt');

    const [ session ] = currentSessions;

    if (!session) {
      console.log('No current sessions');
      return;
    }

    console.log('Current session', session);
    await Session.query().findById(session.id).patch({ processedAt: moment() });
    this.client.action(channelName, `Atenção, vocês têm ${session.duration} minutos para pegar ${session.bonus} clacks com o comando !pegar`);
  }
}

module.exports = ClackSpawner;
