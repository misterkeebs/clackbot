/* eslint-disable no-console */
const moment = require('moment');
const Promise = require('bluebird');

const TwitchApi = require('./TwitchApi');
const discord = require('./DiscordClient');
const { send } = require('./Utils');

const annChannel = process.env.DISCORD_ANNOUNCE_CHANNEL || 'announcements';
const alertRole = process.env.DISCORD_GB_ALERT_ROLE;
const channelName = process.env.TWITCH_CHANNEL;
const twitch = new TwitchApi();

const Session = require('./models/Session');
const Raffle = require('./models/Raffle');
const GroupBuy = require('./models/GroupBuy');

class ClackSpawner {
  constructor(client) {
    this.client = client;
    discord.login(process.env.DISCORD_TOKEN);
  }

  notify(animation, title, text) {
    return send('overlay', { animation, title, text });
  }

  timer(title, endsAt) {
    return send('timer', { title, endsAt });
  }

  async check() {
    const channel = await twitch.getCurrentStream(channelName);

    if (!channel) {
      console.log(channelName, 'is not streaming, checking for other things to notify.');
      await this.checkDiscord();
      return;
    }

    // finds current raffle
    const raffle = await Raffle.current();
    if (raffle) {
      console.log(`There's a raffle ongoing, skipping session...`, raffle);
      if (!raffle.notifiedAt) {
        console.log('Notifying about raffle...');
        await this.timer(`SORTEIO ${raffle.name.toUpperCase()}`, raffle.endsAt.toISOString());
        await this.notify('fireworks', 'SORTEIO ATIVO!',
          `Envie <code>!sorteio &lt;clacks&gt;</code> agora para concorrer a <b>${raffle.name}</b>!`);
        await raffle.markAsNotified();
      }
      return;
    }

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
    await this.notify('coins', 'RODADA DE CLACKS',
      `Envie <code>!pegar</code> agora para acumular ${session.bonus} clacks!`);
    await this.timer(`PEGAR ${session.bonus} CLACKS`, session.endsAt.toISOString());
    this.client.action(channelName, `Atenção, vocês têm ${session.duration} minuto(s) para pegar ${session.bonus} clack(s) com o comando !pegar`);
  }

  async checkDiscord() {
    if (!alertRole) return;

    const gbs = await GroupBuy.pending();
    const channel = discord.channels.cache.find(c => c.name === annChannel);

    await Promise.map(gbs, async gb => {
      const time = moment(gb.startsAt);
      time.locale('pt-br');

      if (time.isBefore(moment())) {
        channel.send(`<@&${alertRole}> **${gb.name}** começou - ${gb.url}`);
        return gb.markNotified();
      }

      if (!gb.warnedAt) {
        channel.send(`<@&${alertRole}> **${gb.name}** começa ${time.fromNow()} - ${gb.url}`);
        return gb.markWarned();
      }
      return Promise.resolve();
    });
  }
}

module.exports = ClackSpawner;
