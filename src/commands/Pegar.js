const Session = require('../models/Session');
const User = require('../models/User');
const { isTwitchSub } = require('../Utils');

module.exports = async (iface, { channel, user: userName, userData }) => {
  const session = await Session.last();

  if (!session) {
    return await iface.reply(channel, userName, 'não existem clacks disponíveis ainda, aguarde!');
  }

  let [ user ] = await User.query().where('displayName', userName);
  const isSub = isTwitchSub(userData);

  if (user) {
    if (user.lastSessionId === session.id) {
      return await iface.reply(channel, userName, `você já participou dessa rodada, aguarde a próxima!`);
    }
    user = await user.addFromSession(session, isSub);
  } else {
    user = await User.createFromSession(userName, session, isSub);
  }

  const bonus = session.bonusAmount(isSub);
  const msg = [`você pegou ${bonus} clack(s)! Você agora tem um total de ${user.bonus}.`];
  if (isSub) {
    msg.unshift('obrigado por ser um inscrito! Por conta disso,');
  }
  return await iface.reply(channel, userName, msg.join(' '));
};
