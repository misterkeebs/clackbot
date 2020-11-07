const _ = require('lodash');

const User = require('../models/User');

class DiscordInterface {
  constructor(bot, client) {
    this.bot = bot;
    this.client = client;
    this.name = 'discord';

    this.client.on('message', async msg => {
      if (msg.author.bot) return;
      if (!msg.content.startsWith('!')) return;

      console.log('msg', msg.content);

      const { author } = msg;
      const [ rawCommand, params ] = msg.content.split(' ');
      const command = rawCommand.slice(1);
      const userName = `${author.username}#${author.discriminator}`;

      const discordId = msg.author.id;
      const [ user ] = await User.query()
        .where('discordId', discordId)
        .orWhere('discordWannabe', userName);

      console.log('command', command);
      const handler = bot.getCommand(command);
      if (!handler) return;

      if (!user) {
        return msg.reply(`você precisa linkar a sua conta do Twitch. Prá isso, visite o chat do SrTeclados e digite \`!eusou ${userName}.\``);
      }

      this.bot.handleMessage(this, { channel: msg.channel.id, user: user.displayName, message: msg.content, rawMessage: msg });
    });

    // this.client.on('chat', async (channel, userData, message, _self) => {
    //   console.log('userData', userData);
    //   const user = userData['display-name'];
    //   await this.bot.handleMessage(this, { channel, user, message, userData });
    // });
  }

  async reply(channelId, dbUser, message) {
    const channel = this.client.channels.cache.find(c => c.id === channelId);
    const displayName = dbUser.displayName || dbUser;
    if (Number.isFinite(dbUser)) {
      return channel.send(`${dbUser} ${message}`);
    }

    if (_.isString(displayName)) {
      const [ user ] = await User.query().where('displayName', displayName);
      if (user.discordId) {
        return channel.send(`<@${user.discordId}> ${message}`);
      }
    }

    return channel.send(`${dbUser} ${message}`);
  }
}

module.exports = DiscordInterface;
