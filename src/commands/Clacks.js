const User = require('../models/User');

module.exports = async (iface, { channel, user: userName }) => {
  const [user] = await User.query().where('displayName', userName);

  if (iface.name === 'discord') {
    if (!user || (user.bonus < 1 && user.sols < 1)) {
      return await iface.reply(channel, userName, 'você ainda não tem clacks, assista os streams no Twitch para ganhar!');
    }

    const msg = [];
    if (user.bonus && user.bonus > 0) {
      msg.push(`:coin: ${user.bonus}`);
    }
    if (user.sols && user.sols > 0) {
      msg.push(`:sun_with_face: ${user.sols}`);
    }
    return await iface.reply(channel, userName, `você já tem ${msg.join(' e ')}.`);
  }

  if (!user || user.bonus < 1) {
    return await iface.reply(channel, userName, 'você ainda não tem clacks, fique esperto na próxima rodada!');
  }

  return await iface.reply(channel, userName, `você já tem :coin: ${user.bonus}.`);
};
