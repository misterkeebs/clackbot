/* eslint-disable no-console */
const moment = require('moment');
const fetch = require('node-fetch');

const TwitchApi = require('./TwitchApi');

const channelName = process.env.TWITCH_CHANNEL;
const twitch = new TwitchApi();

const Session = require('./models/Session');

class ClackSpawner {
  constructor(client) {
    this.client = client;
  }

  async check() {
    const _channel = await twitch.getCurrentStream(channelName);

    // if (!channel) {
    //   console.log(channelName, 'is not streaming, skipping.');
    //   return;
    // }

    // finds current sessions
    const now = moment().toISOString();
    const pendingSessions = await Session.query()
      .whereNull('processedAt')
      .where('startsAt', '>=', now)
      .where('endsAt', '>=', now)
      .orderBy('startsAt');

    console.log('Pending sessions', pendingSessions.length);

    if (!pendingSessions.length) {
      console.log('No pending session, attempting to create...');
      const session = await Session.create();
      console.log('Session', session);
      if (session) {
        console.log('New session created', session);
        return;
      }
    }

    const currentSessions = await Session.query()
      .where('startsAt', '<=', now)
      .where('endsAt', '>=', now)
      .whereNull('processedAt')
      .orderBy('startsAt');

    console.log('Current sessions', currentSessions.length);

    const [ session ] = currentSessions;

    if (!session) {
      console.log('No current sessions');
      return;
    }

    console.log('Current session', session);
    await Session.query().findById(session.id).patch({ processedAt: moment() });
    await fetch(`${process.env.API_SERVER}/start-session`, {
      method: 'POST',
      body: JSON.stringify(session),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.client.action(channelName, `Atenção, vocês têm ${session.duration} minuto(s) para pegar ${session.bonus} clack(s) com o comando !pegar`);
  }
}

module.exports = ClackSpawner;
