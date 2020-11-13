const User = require('../models/User');

module.exports = async (iface, { channel, user: userName }) => {
  const [ user ] = await User.query().where('displayName', userName);

  if (!user || user.bonus < 1) {
    return iface.reply(channel, userName, 'você ainda não tem clacks, fique esperto na próxima rodada!');
  }

  return await iface.reply(channel, userName, `você já tem ${user.bonus} clacks.`);
};
