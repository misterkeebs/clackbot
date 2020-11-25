const Guesses = require('../commands/Guesses');
const { isTwitchMod } = require('../Utils');

const guesses = Guesses.getInstance();

module.exports = async (iface, { channel, user: userName, message, userData }) => {
  const isMod = isTwitchMod(userData);
  if (!isMod) return;

  if (guesses.tracking) {
    const [ _cmd, ...params ] = message.split(' ');
    if (params.length < 0) {
      return await iface.reply(channel, userName, 'para finalizar o wpm use !wpm <wpm atual>');
    }
    return guesses.pickWinner(iface, channel, params[0]);
  } else {
    guesses.start();
    return await iface.send(channel, `SrTeclados começou um typing test. Digite o número correspondente ao WPM que vc acha que ele vai alcançar e ganhe ${guesses.bonus} clacks se acertar ou chegar mais próximo!`);
  }
};
