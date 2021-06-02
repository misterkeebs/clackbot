const NotEnoughBonusError = require('../../models/NotEnoughBonusError');
const NoCodesLeftError = require('../../models/NoCodesLeftError');
const AlreadyRedeemedError = require('../../models/AlreadyRedeemedError');

const Command = require('../Command');
const User = require('../../models/User');
const RedeemableCode = require('../../models/RedeemableCode');

const AMOUNT = 50;

class ResgatarCommand extends Command {
  command = 'resgatar';

  async handleDefault() {
    try {
      const codeObj = await this.user.redeem(AMOUNT);
      await this.sendDirect(`Você resgatou ${AMOUNT} clacks e pode usar o código **${codeObj.code}** no sorteio atual.`);
      return await this.reply(`obrigado por resgatar ${AMOUNT} clacks. Seu código para participar do sorteio foi enviado via DM.`);
    } catch (err) {
      if (err instanceof NoCodesLeftError) {
        return await this.reply(`não existem mais códigos disponíveis.`);
      }
      if (err instanceof AlreadyRedeemedError) {
        return await this.reply(`você já resgatou seu código. Caso não tenha recebido ainda, mande \`!resgatar reenviar\` para receber a DM novamente.`);
      }
      if (err instanceof NotEnoughBonusError) {
        return await this.reply(`você não tem ${AMOUNT} clacks para resgatar.`);
      }
      console.log('Error on redeem', err);
      throw err;
    }
  }

  async handleReenviar() {
    const codeObj = await RedeemableCode.query().where('redeemed_by', this.user.id).first();
    if (codeObj) {
      await this.reply(`seu código foi reenviado em DM.`);
      return await this.sendDirect(`Você resgatou ${AMOUNT} clacks e pode usar o código **${codeObj.code}** no sorteio atual.`);
    }
    return await this.reply('você não resgatou um código ainda.');
  }

  async handleQuantos() {
    const { count } = await RedeemableCode.query().whereNull('redeemed_by').count().first();
    if (count > 0) {
      return await this.reply(`ainda temos ${count} códigos disponíveis.`);
    }
    return await this.reply('todos os códigos já foram usados.');
  }

  async handle() {
    await this.handleSubcommand();
  }
}

const Resgatar = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  await new ResgatarCommand({ iface, channel, userName, message, rawMessage }).run();
};
Resgatar.interfaces = ['discord'];

module.exports = Resgatar;
