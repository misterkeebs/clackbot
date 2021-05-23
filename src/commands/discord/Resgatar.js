const NotEnoughBonusError = require('../../models/NotEnoughBonusError');
const NoCodesLeftError = require('../../models/NoCodesLeftError');
const AlreadyRedeemedError = require('../../models/AlreadyRedeemedError');
const User = require('../../models/User');

const Doar = async (iface, { channel, user: userName, message, rawMessage={} }) => {
  const [ user ] = await User.query().where('displayName', userName);
  const { author } = rawMessage;
  const amount = 50;

  try {
    const codeObj = await user.redeem(amount);
    // await author.send(`Você resgatou 50 clacks e pode usar o código **${codeObj.code}** no sorteio atual.`);
    return await iface.reply(channel, userName, `obrigado por resgatar ${amount} clacks. Seu código para participar do sorteio foi enviado via DM.`);
  } catch (err) {
    if (err instanceof NoCodesLeftError) {
      return await iface.reply(channel, userName, `não existem mais códigos disponíveis.`);
    }
    if (err instanceof AlreadyRedeemedError) {
      return await iface.reply(channel, userName, `você não tem ${amount} clacks para resgatar.`);
    }
    if (err instanceof NotEnoughBonusError) {
      return await iface.reply(channel, userName, `você não tem ${amount} clacks para resgatar.`);
    }
    console.log('Error on redeem', err);
    throw err;
  }
};
Doar.interfaces = ['discord'];

module.exports = Doar;
