const _ = require('lodash');

const Session = require('../models/Session');
const { isTwitchMod } = require('../Utils');

module.exports = async (iface, { channel, user, message, userData }) => {
  const isMod = isTwitchMod(userData);

  const session = await Session.current();
  if (session) {
    const { timeLeft } = session;
    const msg = timeLeft < 1
      ? `menos de um minuto`
      : (timeLeft > 1 ? `mais ${timeLeft} minutos` : `mais 1 minuto`);
    return await iface.reply(channel, user, `rodada em andamento por ${msg}.`);
  }

  const parts = message.split(' ');
  if (isMod && parts[1] === 'criar') {
    const res = await Session.create(true);
    if (!res) {
      await iface.reply(channel, user, 'já existe uma rodada ativa.');
    } else {
      await iface.reply(channel, user, 'criando nova rodada...');
    }
    return;
  }

  await iface.reply(channel, user, 'nenhuma rodada em andamento.');
};
