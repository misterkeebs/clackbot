const User = require('../models/User');

module.exports = async (iface, { channel, user: userName, message }) => {
  const [otherUser] = (message || '').split(' ').slice(1);
  const user = await User.find(otherUser || userName);
  const name = otherUser || 'você';

  if (iface.name === 'discord') {
    if (otherUser && !user) {
      return await iface.reply(channel, userName, `ainda não conheço o usuário ${otherUser}.`);
    }
    if (!user || (user.bonus < 1 && user.sols < 1)) {
      const suffix = otherUser ? '.' : `, assista os streams no Twitch para ganhar!`;
      return await iface.reply(channel, userName, `${name} ainda não tem clacks${suffix}`);
    }

    const msg = [];
    if (user.bonus && user.bonus > 0) {
      msg.push(`:coin: ${user.bonus}`);
    }
    if (user.sols && user.sols > 0) {
      msg.push(`:sun_with_face: ${user.sols}`);
    }
    return await iface.reply(channel, userName, `${name} já tem ${msg.join(' e ')}.`);
  }

  if (!user || user.bonus < 1) {
    const suffix = otherUser ? '.' : `, fique esperto na próxima rodada!`;
    return await iface.reply(channel, userName, `${name} ainda não tem clacks${suffix}`);
  }

  return await iface.reply(channel, userName, `${name} já tem :coin: ${user.bonus}.`);
};
