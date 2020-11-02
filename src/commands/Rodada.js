const Session = require('../models/Session');

module.exports = async (iface, { channel, user, message, userData }) => {
  const isMod = userData.mod || userData.badges.broadcaster === '1';

  const session = await Session.current();
  if (session) {
    const { timeLeft } = session;
    const msg = timeLeft < 1
      ? `menos de um minuto`
      : (timeLeft > 1 ? `mais ${timeLeft} minutos` : `mais 1 minuto`);
    return iface.reply(channel, user, `rodada em andamento por ${msg}.`);
  }

  const parts = message.split(' ');
  if (isMod && parts[1] === 'criar') {
    iface.reply(channel, user, 'não há rodada atual, criando uma nova...');
    return await Session.create(true);
  }

  iface.reply(channel, user, 'nenhuma rodada em andamento');
};
