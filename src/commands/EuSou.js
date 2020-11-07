const User = require('../models/User');

const command = async (iface, { channel, user: userName, message, rawMessage }) => {
  const [ _cmd, ...params ] = message.split(' ');
  const target = iface.name === 'twitch' ? 'discord' : 'twitch';
  const data = iface.name === 'twitch' ? { [`${target}Wannabe`]: params.join(' ') } : {};
  const user = await User.updateOrCreate(userName, data);

  if (iface.name === 'discord') {
    const [ twitchUsername ] = params;
    if (twitchUsername !== user.displayName) {
      return await iface.reply(channel, rawMessage.author, `infelizmente você não é ${twitchUsername}. Por favor, tente novamente.`);
    }
    const { author } = rawMessage;
    const userName = `${author.username}#${author.discriminator}`;
    if (userName === user.discordWannabe) {
      await user.$query().patch({ discordId: rawMessage.author.id });
      return await iface.reply(channel, rawMessage.author, 'seu usuário no Twitch foi linkado.');
    } else {
      return await iface.reply(channel, rawMessage.author, 'infelizmente você não é o usuário especificado no Twitch. Por favor, tente novamente');
    }
  }

  await iface.reply(channel, userName, `bom saber. Agora vai no Discord e digita !eusou ${user.displayName} prá confirmar.`);
};
command.needsUser = false;

module.exports = command;
