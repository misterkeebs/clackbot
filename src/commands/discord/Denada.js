const User = require('../../models/User');

const Denada = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  const [user] = await User.query().where('displayName', userName);
  const [receiverName] = message.split(' ').slice(1);

  if (!receiverName) {
    return await iface.reply(channel, userName, 'use `!denada @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda denada.');
  }

  const { mentions } = rawMessage;
  if (!mentions || !mentions.users || mentions.users.size < 1) {
    return await iface.reply(channel, userName, 'você precisa marcar o usuário para dizer de nada: `!denada @<usuário>`.');
  }

  const { users } = mentions;
  const ids = Array.from(users.keys());
  const [receiver] = await User.query().where('discord_id', ids[0]);
  if (!receiver) {
    return await iface.reply(channel, userName, `o usuário ${receiverName} não existe ou não está cadastrado no bot.`);
  }

  if (receiver.id === user.id) {
    return await iface.reply(channel, userName, 'você não pode dizer de nada prá si mesmo.');
  }

  return await iface.reply(channel, receiver, `se você acha que <@!${user.discordId}> te ajudou, você pode doar sols para ele usando \`!doar <sols> @${user.discordWannabe}\`.`);
};
Denada.interfaces = ['discord'];

module.exports = Denada;
