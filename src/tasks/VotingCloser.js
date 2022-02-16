const _ = require('lodash');
const dedent = require('dedent');
const moment = require('moment');
const Promise = require('bluebird');

const WeeklyTask = require('./WeeklyTask');
const Setting = require('../models/Setting');

class VotingCloser extends WeeklyTask {
  constructor(discord) {
    super(
      'VotingCloser',
      process.env.VOTING_CLOSER_WEEKDAY || 'Monday',
      process.env.VOTING_CLOSER_STARTS_AT || '12');
    this.discord = discord;
  }

  async run() {
    console.log('VotingCloser picking winner...');
    await this.pickWinner();
  }

  async getLastDraw() {
    await Setting.get('VOTING_')
  }

  filter(lastDrawStr) {
    const lastDraw = lastDrawStr && moment.tz(lastDrawStr, this.timeZone);
    return msg => {
      if (lastDraw && lastDraw.isAfter(msg.createdTimestamp)) return false;
      if (msg.attachments.size < 1) return false;
      if (msg.reactions.cache.size < 1) return false;
      return true;
    }
  }

  score(msg) {
    const upVotes = msg.reactions.cache.get('🔼').count;
    const downVotes = msg.reactions.cache.get('🔽').count;
    return { msg, upVotes, downVotes };
  }

  rank(a, b) {
    return b.upVotes - a.upVotes;
  }

  async announce(channel, winnerData, runnerUpData) {
    const winner = _.get(winnerData, 'msg.author');
    const runnerUp = _.get(runnerUpData, 'msg.author');

    const winnerText = winner
      ? `Banner do servidor atualizado para a foto enviada por <@${winner.id}> com ${winnerData.upVotes} upvotes.\n`
      : 'Infelizmente nessa semana não tivemos ganhador do banner por falta de submissões.\n';

    const runnerUpText = runnerUpData
      ? `Em segundo lugar tivemos a foto enviada por <@${runnerUp.id}> com ${runnerUpData.upVotes} upvotes.\n`
      : '';

    const text = dedent`
      ${winnerText}${runnerUpText}
      Incentivamos a todos que mandem mais fotos de seus teclados, pois a sua foto pode estar em nosso banner! limite é de 10mb pra foto/gif

      Lembrando que o banner é atualizado toda segunda-feira! Não deixem para postar depois!
      participem o quanto antes! @here

      P.S.: Não esqueçam de mandar os seus banners com specs para facilitar caso você ganhe, e convido vocês para que venham conferir o nosso hall-of-fame aqui: https://kbrd.to/hall-of-fame
    `;

    await channel.send(text);
    await Setting.set(`last-draw-${channel.name}`, moment.tz(this.timeZone).toISOString());
  }

  async pickWinner(votingChannels) {
    const channelStr = votingChannels || process.env.VOTING_CHANNELS;
    if (!channelStr) {
      throw new Error(`No channels defined for picking winner`);
    }

    const channels = channelStr.split(',');
    await Promise.map(channels, async channelName => {
      const channel = await this.discord.channels.cache.find(c => c.name === channelName);
      if (!channel) {
        throw `No channel with name ${channelName} while picking a voting winner`;
      }
      const lastDraw = await Setting.get(`last-draw-${channelName}`);
      const channelMessages = await channel.messages.fetch({ limit: 100 });
      const messages = channelMessages
        .filter(this.filter(lastDraw).bind(this))
        .map(this.score.bind(this))
        .sort(this.rank.bind(this));
      const winner = _.get(messages, '0');
      const runnerUp = _.get(messages, '1');
      await this.announce(channel, winner, runnerUp);
    });
  }
}

module.exports = VotingCloser;
