const _ = require('lodash');
const moment = require('moment');
moment.locale('pt-br');

const DiscordUser = require('../models/DiscordUser');
const UserLastMessage = require('../models/UserLastMessage');

class SlowModeProcessor {
  constructor(channels = process.env.SLOWMODE_CHANNELS) {
    const res = this.parseChannels(channels);
    this.channels = res && res.map(r => r.channel);
    this.intervals = res && res.reduce((obj, v) => {
      obj[v.channel] = v.interval;
      return obj;
    }, {});

    // console.log('Slowmode Channels:', this.intervals);
  }

  parseChannels(str) {
    if (!str) return;
    return str.split(',').map(s => ({
      channel: s.split('|')[0],
      interval: parseInt(s.split('|')[1] || '6', 10),
    }));
  }

  async getMessages(channel) {
    return await channel.messages.fetch({ limit: 100 });
  }

  async handle(msg) {
    const channelName = msg.channel.name;
    if (!this.channels || !this.channels.includes(channelName)) {
      return false;
    }

    const discordId = msg.author.id;
    const lastMessage = await UserLastMessage.for(discordId, channelName);
    if (!lastMessage) {
      await UserLastMessage.track(discordId, channelName);
      return false;
    }

    const interval = this.intervals[channelName];
    const nextAllowedDate = moment(lastMessage).add(interval, 'hours');
    if (nextAllowedDate.isAfter(moment())) {
      await msg.author.send(`Sua mensagem no canal **#${msg.channel.name}** foi excluída porque este canal permite apenas um envio a cada ${interval} horas. Você pode enviar a mensagem novamente em aproximadamente ${moment(nextAllowedDate).fromNow()}.`);
      await msg.delete();
      return true;
    }

    await UserLastMessage.track(discordId, channelName);
    return false;
  }
}

module.exports = SlowModeProcessor;
