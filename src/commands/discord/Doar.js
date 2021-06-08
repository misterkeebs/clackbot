const Command = require('../Command');
const User = require('../../models/User');

const NotEnoughBonusError = require('../../models/NotEnoughBonusError');

class DoarCommand extends Command {
  interfaces = ['discord'];

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
      const { bonus, kickbackAmount } = await this.user.donate(amount, this.receiver)
      const receivedBonus = bonus;
      const kickbackMsg = kickbackAmount > 0 ? ` e você recebeu ${kickbackAmount} clacks de volta!` : `.`;
      return await this.reply(`obrigado por doar ${amount} sols. O usuário ${receiverName} recebeu ${receivedBonus} clacks${kickbackMsg}`);
    } catch (err) {
      if (err instanceof NotEnoughBonusError) {
        return await this.reply(`você não tem ${amount} sols para doar.`);
      }
      throw err;
    }
  }
}

module.exports = DoarCommand;
