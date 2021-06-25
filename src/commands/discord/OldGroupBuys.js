const Discord = require('discord.js');
const Promise = require('bluebird');
const moment = require('moment');
const dedent = require('dedent');

const GroupBuy = require('../../models/GroupBuy');

const GB_ADD_RE = /add (?<name>.+?) (de )?(?<startDate>\d{1,2}\/\d{1,2}(\/\d{2,4})?)( [àa]s (?<startTime>\d{1,2}:\d{1,2}))?( at[ée] (?<endDate>\d{1,2}\/\d{1,2}(\/\d{2,4})?)?( [àa]s (?<endTime>\d{1,2}:\d{1,2}?)?)?)? (?<url>.+)?/;
const GB_MOD_RE = /mod (?<field>.+?) (?<name>.*)? para (?<newValue>.*)?/;
const GB_TIME_RE = /(?<startDate>\d{1,2}\/\d{1,2}(\/\d{2,4})?)( [àa]s (?<startTime>\d{1,2}:\d{1,2}))?/;

function parse(date, time) {
  if (!date) return null;
  const fmt = date.length > 5
    ? (time ? 'DD/MM/YY HH:mm' : 'DD/MM/YY')
    : (time ? 'DD/MM HH:mm' : 'DD/MM');
  return moment(`${date} ${time}`, fmt);
}

class DiscordCmd {
  constructor(iface, rawMessage) {
    this.iface = iface;
    this.message = rawMessage;
    this.author = rawMessage.author;
    this.channel = rawMessage.channel;
    this.content = rawMessage.content;
    this.sender = `${this.author.username}#${this.author.discriminator}`;
    this.parts = this.content.split(' ');
  }

  get command() {
    return this.parts[1];
  }

  reply(msg) {
    this.channel.send(`${this.author} ${msg}`);
  }
}

class GroupByCmd extends DiscordCmd {
  async run() {
    if (!this.command) {
      return this.list();
    } else if (this.command === 'add') {
      return this.add();
    } else if (this.command === 'mod') {
      return this.modify();
    }
  }

  async list() {
    const gbs = await GroupBuy.query()
      .where('startsAt', '<=', moment())
      .where(function () {
        this
          .whereNull('endsAt')
          .orWhere('endsAt', '>=', moment());
      });

    if (gbs.length < 1) {
      return this.reply('nenhum GB ativo no momento.');
    }

    console.log('gbs', gbs);

    await Promise.each(gbs, async gb => {
      const fields = [];
      if (gb.startsAt) {
        const startsAt = moment(gb.startsAt);
        startsAt.locale('pt-BR');
        fields.push({ name: 'Começa', value: startsAt.format('DD MMM [às] HH[h]mm'), inline: true });
      }
      if (gb.endsAt) {
        const endsAt = moment(gb.endsAt);
        endsAt.locale('pt-BR');
        fields.push({ name: 'Termina', value: moment(endsAt).format('DD MMM [às] HH[h]mm'), inline: true });
      }
      let embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(gb.name)
        .setURL(gb.url)
        .addFields(fields);

      if (gb.image) {
        embed = embed.setThumbnail(gb.image);
      }

      await this.channel.send(embed);
    });
  }

  async modify() {
    const { groups } = this.message.content.match(GB_MOD_RE) || {};
    if (!groups) {
      return this.reply('use o comando assim: `!gb mod [nome|início|fim] para <novo valor>`.');
    }
    const { field, name, newValue } = groups;
    const [gb] = await GroupBuy.query().where('name', name);

    if (!gb) {
      return this.reply(`o group buy **${name}** não foi encontrado.`);
    }

    if (field === 'nome') {
      await gb.$query().patch({ name: newValue });
      return this.reply(`nome alterado para ${newValue}.`);
    } else if (field === 'imagem') {
      await gb.$query().patch({ image: newValue });
      return this.reply(`imagem alterada para ${newValue}.`);
    } else if (field === 'inicio' || field === 'início' || field === 'fim') {
      const { groups } = newValue.match(GB_TIME_RE);
      const { startDate, startTime } = groups;
      const changedValue = parse(startDate, startTime);
      const attr = field === 'fim'
        ? { endsAt: changedValue } : { startsAt: changedValue };
      await gb.$query().patch(attr);
      const localMoment = moment(changedValue);
      localMoment.locale('pt-BR');
      return this.reply(`${field} alterado para ${localMoment.format('ddd, D MMM YYYY às HH:mm')}.`);
    }

    return this.reply(`você só pode alterar os campos nome, início e fim.`);
  }

  async add() {
    const { groups } = this.message.content.match(GB_ADD_RE) || {};
    if (!groups) {
      return this.reply(dedent`favor incluir ao menos a data de início. Use uma das formas abaixo:

      !gb add Nome GB 12/10 https://gb1.com
      !gb add Nome GB 12/10 às 8:00 https://gb2.com
      !gb add Nome GB de 12/10 às 8:00 até 14/11 às 21:45 https://gb3.com
      `);
    }
    const { name, startDate, startTime, endDate, endTime, url } = groups;
    const startsAt = parse(startDate, startTime);
    const endsAt = parse(endDate, endTime);
    const createdAt = moment();
    const createdBy = this.sender;
    await GroupBuy.query().insert({ name, startsAt, endsAt, createdAt, createdBy, url });
    this.reply(`group buy ${name} adicionado.`);
  }
}

const Handler = async (iface, { rawMessage }) => {
  return await new GroupByCmd(iface, rawMessage).run();
};
Handler.interfaces = ['discord'];

module.exports = Handler;
