const Session = require('../models/Session');
const User = require('../models/User');

module.exports = async (iface, { channel, user: userName, userData }) => {
  const session = await Session.last();

  if (!session) {
    return iface.reply(channel, userName, 'não existem clacks disponíveis ainda, aguarde!');
  }

  let [ user ] = await User.query().where('displayName', userName);

  if (user) {
    if (user.lastSessionId === session.id) {
      return iface.reply(channel, userName, `você já participou dessa rodada, aguarde a próxima!`);
    }
    user = await user.addFromSession(session, userData.subscriber);
  } else {
    user = await User.createFromSession(userName, session, userData.subscriber);
  }

  const bonus = session.bonusAmount(userData.subscriber);
  const msg = [`você pegou ${bonus} clack(s)! Você agora tem um total de ${user.bonus}.`];
  if (userData.subscriber) {
    msg.unshift('obrigado por ser um inscrito! Por conta disso,');
  }
  return iface.reply(channel, userName, msg.join(' '));
};
