const _fetch = require('node-fetch');
const Discord = require('discord.js');
const moment = require('moment');

const GroupBuy = require('../models/GroupBuy');
const Setting = require('../models/Setting');

const annChannel = process.env.DISCORD_ANNOUNCE_CHANNEL || 'announcements';
const alertRole = process.env.DISCORD_GB_ALERT_ROLE;
const alertThumb = process.env.DISCORD_GB_THUMB;
const alertHour = process.env.DISCORD_GB_ALERT_HOUR;

class GroupBuyNotifier {
  constructor(client, discord) {
    this.client = client;
    this.discord = discord;
  }

  async canRun(alertHour) {
    const lastRun = await Setting.get('LAST_GB_NOTIFICATION');
    if (!lastRun) return true;

    const lastRunDate = moment(lastRun);

    const validIfAfter = lastRunDate.add(1, 'day').startOf('day');
    if (!moment().isAfter(validIfAfter)) return false;

    return alertHour.toString() === moment().format('H');
  }

  async execute() {
    console.log('Checking if GB notify can run...');
    if (!await this.canRun(alertHour)) return;

    console.log('Updating groupbuys...');
    await this.update();

    console.log('Finding GBs to notify...');
    const starting = await GroupBuy.starting();
    const ending = await GroupBuy.ending();

    console.log(`Notifying ${starting.length} starting GBs...`);
    if (starting.length > 0) {
      await this.formatNotice('starting', '#32cd32', starting);
    }
    console.log(`Notifying ${ending.length} ending GBs...`);
    if (ending.length > 0) {
      await this.formatNotice('ending', '#bb2b1b', ending);
    }

    await Setting.set('LAST_GB_NOTIFICATION', moment().toString());
  }

  async update(fetch = _fetch) {
    await GroupBuy.query().truncate();

    const res = await fetch(`https://www.mechgroupbuys.com/gb-data`);
    const json = await res.json();
    const data = json
      .filter(entry => !!entry.name)
      .map(entry => GroupBuy.fromData(entry));
    return await Promise.all(data);
  }

  formatNotice(title, color, gbs) {
    const embed = new Discord.MessageEmbed()
      .setColor(color)
      .setAuthor(`GBs ${title} today`, alertThumb);

    const fields = [
      ['Starts', 'startsAt', 'date'],
      ['Ends', 'endsAt', 'date'],
      [null, 'pricing'],
    ];

    gbs.forEach(gb => {
      const body = [];
      fields.forEach(([label, field, format]) => {
        if (gb[field] && (format === 'date' || gb[field].length > 0)) {
          const item = (label ? `> ${label}: ` : '> ')
            + (format === 'date' ? moment(gb[field]).format('MMM D') : gb[field]);
          body.push(item);
        }
      });

      if (gb.additionalLinks && gb.additionalLinks.length) {
        const [link] = gb.additionalLinks.split(',').map(l => l.trim());
        const parts = link.split(': ');
        body.push(`> [${parts[0]}](${parts[1]})`);
      }

      embed.addField(gb.name, body.join('\n'), true);
    });

    const channel = this.discord.channels.cache.find(c => c.name === annChannel);
    return channel.send(`<@&${alertRole}> there are ${gbs.length} groupbuys ${title} today:`, embed);
  }
}

module.exports = GroupBuyNotifier;
