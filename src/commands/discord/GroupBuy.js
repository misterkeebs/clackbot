const _ = require('lodash');
const Discord = require('discord.js');
const moment = require('moment');
moment.locale('pt-br');

const Command = require('../Command');
const AlreadyRedeemedError = require('../../models/AlreadyRedeemedError');
const User = require('../../models/User');
const GroupBuy = require('../../models/GroupBuy');

const alertThumb = process.env.DISCORD_GB_THUMB;
const alertImage = process.env.DISCORD_GB_IMAGE;

class GroupBuyCommand extends Command {
  interfaces = ['discord'];

  async handle() {
    const [query, spos] = this.args.join(' ').split('~');
    const pos = spos ? parseInt(spos, 10) - 1 : null;

    if (_.isEmpty(query)) {
      return await this.reply('use `!gb <pesquisa>`. Para mais informações sobre como doações funcionam use !ajuda gb.');
    }

    const hits = await GroupBuy.query().where('name', 'ilike', `%${query}%`);
    const gbs = spos ? [hits[pos]] : hits;

    if (gbs.length < 1) {
      return await this.reply(`nenhum groupbuy encontrado com o termo \`${query}\``);
    }

    if (gbs.length === 1) {
      await this.sendCard(gbs[0]);
      return;
    }

    if (gbs.length > 10) {
      await this.sendList(query, gbs.slice(0, 10));
      return;
    }

    await this.sendList(query, gbs);
  }

  static formatMulti(str) {
    return str.split(',').map(s => s.trim()).map(s => {
      const [key, ...values] = s.split(':');
      const value = values.join(':');
      if (value.includes(':')) {
        return `${key}\n> ${value.trim().replace(/:/, '\n>')}`;
      }
      return `> ${s}`;
    }).join('\n');
  }

  async sendCard(gb) {
    const fields = [
      ['Starts', 'startsAt', 'date'],
      ['Ends', 'endsAt', 'date'],
      ['Sale Type', 'saleType'],
      ['Pricing', 'pricing', 'multi'],
      ['Vendors', 'vendors', 'multi'],
    ];

    const formats = {
      date: v => moment(v).format('DD MMM YYYY'),
      multi: v => GroupBuyCommand.formatMulti(v),
    };

    const embed = new Discord.MessageEmbed()
      .setColor('#543e94')
      .setTitle(gb.name)
      .setImage(gb.mainImage)
      .setThumbnail(alertImage)
      .setAuthor('Informação do GroupBuy', 'https://images-ext-2.discordapp.net/external/7mJlSRNI6rDgvoVR1LSqXJvsgiGI4rHO2Msgg5b8M88/https/static-cdn.jtvnw.net/jtv_user_pictures/7ecbe0e8-904d-49c5-b87d-dcadda378864-profile_image-300x300.png');

    const embedFields = fields.map(([label, field, format]) => {
      const fv = gb[field];
      // if (_.isEmpty(fv)) {
      //   return null;
      // }
      const value = format ? formats[format](fv) : fv;
      return { name: label, value };
    }).filter(v => !!v);

    embed.addFields(embedFields);

    return await this.rawMessage.channel.send(embed);
  }

  async sendList(query, gbs) {
    const embed = new Discord.MessageEmbed()
      .setColor('#543e94')
      .setThumbnail(alertImage)
      .setAuthor('Múltiplos GBs Encontrolados', alertThumb)
      .setDescription(`Encontramos ${gbs.length} GBs com seu termo de busca, use um termo mais específico ou um atalho listado abaixo.`)
      .addFields(gbs.map((gb, idx) => {
        return { name: gb.name, value: `\`!gb ${query}~${idx + 1}\`` };
      }));

    return await this.rawMessage.channel.send(embed);
  }
}

module.exports = GroupBuyCommand;
