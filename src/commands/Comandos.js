const _ = require('lodash');

const Command = require('./Command');
const { isClass } = require('../Utils');

class Comandos extends Command {
  async handle() {
    return await this.handleByInterface();
  }

  async handleDiscord() {
    const { handlers } = this.bot;
    const discordCmds = Object.keys(handlers)
      .filter(k => {
        const handler = handlers[k];
        const interfaces = (isClass(handler)
          ? new handler({}).interfaces
          : handler.interfaces) || [];

        return interfaces.includes('discord');
      }).sort();
    const msg = ['comandos disponíveis:', ''];
    msg.push(discordCmds.map(cmd => `\`${cmd}\``));

    this.reply(_.flatten(msg).join('\n'));
  }

  async handleTwitch() {

  }
}

module.exports = Comandos;
