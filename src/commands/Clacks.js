const User = require('../models/User');

module.exports = async (iface, { channel, user: userName }) => {
  const [ user ] = await User.query().where('displayName', userName);

  if (!user || user.bonus < 1) {
    return await iface.reply(channel, userName, 'você ainda não tem clacks, fique esperto na próxima rodada!');
  }

  if (iface.name === 'discord') {
    return await iface.reply(channel, userName, `você tem ${user.bonus} clacks e ${user.sols} sols.`);
  }

  return await iface.reply(channel, userName, `você já tem ${user.bonus} clacks.`);
};
