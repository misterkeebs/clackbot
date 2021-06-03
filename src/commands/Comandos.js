const _ = require('lodash');

const Command = require('./Command');
const { isClass } = require('../Utils');

class Comandos extends Command {
  interfaces = ['discord', 'twitch'];
  description = 'lista todos os comandos (o que vc está vendo agora)';

  async handle() {
    this.reply(await this.handleByInterface());
  }

  filter(ifaceName, blanks = false) {
    const { handlers } = this.bot;
    return Object.keys(handlers)
      .filter(k => {
        const handler = handlers[k];
        const interfaces = (isClass(handler)
          ? new handler({}).interfaces
          : handler.interfaces) || [];

        return interfaces.includes(ifaceName) || (blanks && _.isEmpty(interfaces));
      })
      .sort()
      .map(cmd => {
        const handler = handlers[cmd];
        const desc = isClass(handler)
          ? new handler({}).description
          : handler.description;
        return { cmd, desc };
      });
  }

  async handleDiscord() {
    const commands = this.filter('discord');
    const msg = ['comandos disponíveis:', ''];
    msg.push(commands.map(o => `\`${o.cmd}\`${o.desc ? ` - ${o.desc}` : ''}`));

    return _.flatten(msg).join('\n');
  }

  async handleTwitch() {
    const cmds = this.filter('twitch', true).map(o => `${o.cmd}`);
    return `comandos disponíveis: ${cmds.join(', ')}`;
  }
}

module.exports = Comandos;
