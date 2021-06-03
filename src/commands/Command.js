const _ = require('lodash');

const User = require('../models/User');

class Command {
  constructor({ iface, channel, user, message, rawMessage = {} }) {
    this.iface = iface;
    this.channel = channel;
    this.userName = user;
    this.message = message;
    this.rawMessage = rawMessage;
  }

  get bot() {
    return _.get(this, 'iface.bot');
  }

  get args() {
    return this.message.split(' ').slice(1);
  }

  get mentionedIds() {
    const mentionedUsers = _.get(this.rawMessage, 'mentions.users');
    if (!mentionedUsers) return [];
    return Array.from(mentionedUsers.keys());
  }

  get mentionedId() {
    return this.mentionedIds[0];
  }

  get author() {
    return this.rawMessage.author;
  }

  async run() {
    await this.load();
    await this.handle();
  }

  async handleByInterface() {
    if (this.iface.name === 'discord') {
      return await this.handleDiscord();
    }
    if (this.iface.name === 'twitch') {
      return await this.handleTwitch();
    }
    throw new Error('Unkown interface name: ' + this.iface.name);
  }

  async handleSubcommand() {
    const subcommand = this.args[0];
    if (!subcommand) {
      return await this.handleDefault();
    }

    const subcmdFnName = `handle${_.startCase(_.toLower(subcommand))}`;
    const subcmdFn = this[subcmdFnName];
    if (!_.isFunction(subcmdFn)) {
      return await this.reply(`comando inválido. Use \`!ajuda ${this.command}\` para mais informações.`)
    }
    return await subcmdFn.bind(this)();
  }

  async getReceiver() {
    if (!this.mentionedId) return;
    const [receiver] = await User.query().where('discord_id', this.mentionedId);
    return receiver;
  }

  async load() {
    this.receiver = await this.getReceiver();
    this.user = await this.getUser();
  }

  async getUser() {
    if (this.user) return this.user;

    const [user] = await User.query().where('displayName', this.userName);
    this.user = user;
    return user;
  }

  async reply(message) {
    return await this.iface.reply(this.channel, this.userName, message);
  }

  async sendToReceiver(message) {
    return await this.iface.reply(this.channel, this.receiver, message);
  }

  async sendDirect(message) {
    return await this.author.send(message);
  }
}

module.exports = Command;
