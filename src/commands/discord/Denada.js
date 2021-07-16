const User = require('../../models/User');
const Command = require('../Command');

class DenadaCommand extends Command {
  static interfaces = ['discord'];

  async handle() {
    const [receiverName] = this.args;
    if (!receiverName) {
      return await this.reply('use `!denada @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda denada.');
    }

    if (!this.mentionedId) {
      return await this.reply('você precisa marcar o usuário para dizer de nada: `!denada @<usuário>`.');
    }

    if (!this.receiver) {
      return await this.reply(`o usuário ${receiverName} não existe ou não está cadastrado no bot.`);
    }

    if (this.receiver.id === this.user.id) {
      return await this.reply('você não pode dizer de nada prá si mesmo.');
    }

    return await this.sendToReceiver(`se você acha que <@!${this.user.discordId}> te ajudou, você pode doar sols para ele usando \`!doar <sols> @${this.user.discordWannabe}\`.`);
  }
}

module.exports = DenadaCommand;
