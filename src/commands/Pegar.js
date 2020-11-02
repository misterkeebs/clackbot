const moment = require('moment');

const Session = require('../models/Session');
const User = require('../models/User');

module.exports = async (iface, channel, userName, _message) => {
  const sessions = await Session.query()
    .where('startsAt', '<=', moment())
    .where('endsAt', '>=', moment())
    .whereNull('processedAt')
    .orderBy('startsAt');

  const [ session ] = sessions;

  if (!session) {
    return iface.reply(channel, user, 'não existem clacks disponíveis ainda, aguarde!');
  }

  let [ user ] = await User.query().where('displayName', userName);

  if (user) {
    if (user.lastSessionId >= session.id) {
      return iface.reply(channel, userName, `você já participou dessa rodada, aguarde a próxima!`);
    }
    user = await user.$query().patchAndFetch({ bonus: user.bonus + session.bonus });
  } else {
    user = await User.query().insertAndFetch({ displayName: userName, bonus: session.bonus, lastSessionId: session.id });
  }

  return iface.reply(channel, userName, `você pegou ${session.bonus} clack(s)! Você agora tem um total de ${user.bonus}.`);
};
