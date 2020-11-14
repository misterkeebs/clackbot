const NotEnoughBonusError = require('../../models/NotEnoughBonusError');
const User = require('../../models/User');

const Doar = async (iface, { channel, user: userName, message, rawMessage={} }) => {
  const [ user ] = await User.query().where('displayName', userName);
  const [ amountStr, receiverName ] = message.split(' ').slice(1);
  const amount = parseInt(amountStr, 10);

  if (!amountStr || !receiverName || isNaN(amount) || amount < 1) {
    return await iface.reply(channel, userName, 'use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
  }

  const { mentions } = rawMessage;
  if (!mentions || !mentions.users || mentions.users.size < 1) {
    return await iface.reply(channel, userName, 'você precisa marcar o usuário para o qual quer doar: `!doar <sols> @<usuário>`.');
  }

  const { users } = mentions;
  const ids = Array.from(users.keys());
  const [ receiver ] = await User.query().where('discord_id', ids[0]);
  if (!receiver) {
    return await iface.reply(channel, userName, `o usuário ${receiverName} não existe.`);
  }

  if (receiver.id === user.id) {
    return await iface.reply(channel, userName, 'você não pode doar prá si mesmo.');
  }

  try {
    const receivedBonus = await user.donate(amount, receiver);
    return await iface.reply(channel, userName, `obrigado por doar ${amount} sols. O usuário ${receiverName} recebeu ${receivedBonus} clacks.`);
  } catch (err) {
    if (err instanceof NotEnoughBonusError) {
      return await iface.reply(channel, userName, `você não tem ${amount} sols para doar.`);
    }
  }
};
Doar.interfaces = ['discord'];

module.exports = Doar;
