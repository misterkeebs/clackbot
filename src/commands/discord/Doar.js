const Command = require('../Command');
const User = require('../../models/User');

const NotEnoughBonusError = require('../../models/NotEnoughBonusError');

class DoarCommand extends Command {
  async handle() {
    const [amountStr, receiverName] = this.args;
    const amount = parseInt(amountStr, 10);

    if (!amountStr || !receiverName || isNaN(amount) || amount < 1) {
      return await this.reply('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    }

    if (!this.mentionedId) {
      return await this.reply('você precisa marcar o usuário para o qual quer doar: `!doar <sols> @<usuário>`.');
    }

    if (this.receiver && this.receiver.id === this.user.id) {
      return await this.reply('você não pode doar prá si mesmo.');
    }

    if (!this.receiver) {
      return await this.reply(`o usuário ${receiverName} não existe ou não está disponível para receber doações.`);
    }

    try {
      const receivedBonus = await this.user.donate(amount, this.receiver);
      return await this.reply(`obrigado por doar ${amount} sols. O usuário ${receiverName} recebeu ${receivedBonus} clacks.`);
    } catch (err) {
      if (err instanceof NotEnoughBonusError) {
        return await this.reply(`você não tem ${amount} sols para doar.`);
      }
      throw err;
    }
  }
}

const Doar = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  return await new DoarCommand({ iface, channel, userName, message, rawMessage }).run();
};
Doar.interfaces = ['discord'];

module.exports = Doar;
