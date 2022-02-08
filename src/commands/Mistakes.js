const moment = require('moment');
const Cooldown = require('../models/Cooldown');
const Setting = require('../models/Setting');
const { send } = require('../Utils');

module.exports = async (iface, { channel, user: userName, message }) => {
  const name = process.env.TWITCH_CHANNEL;
  const today = `mistakes-${moment().format('YYYYMMDD')}`;
  const initMistakes = await Setting.get('mistakes', '0');
  const initSessionMistakes = await Setting.get(today, '0');
  let mistakes = parseInt(initMistakes, 10);
  let sessionMistakes = parseInt(initSessionMistakes, 10);

  const parts = message.split(' ');

  if (parts[0].endsWith('++') || parts[0].endsWith('--')) {
    if (!await Cooldown.for('mistakes', 1)) {
      return await iface.reply(channel, userName, 'esse comando só pode ser utilizado uma vez por minuto.');
    }
  }

  if (parts[0].endsWith('++')) {
    await Setting.set('mistakes', ++mistakes);
    await Setting.set(today, ++sessionMistakes);
    await send('newMistake', { mistakes, sessionMistakes });
    return await iface.send(channel, `${name} fez merda de novo. Ele já fez merda ${mistakes} vezes, sendo ${sessionMistakes} só hoje.`);
  }

  if (parts[0].endsWith('--')) {
    if (mistakes < 1) {
      return await iface.send(channel, `${name} não fez nenhuma merda ainda. Milagre?`);
    }

    if (sessionMistakes < 1) {
      return await iface.send(channel, `${name} agradece muito a tentativa, mas ele não fez nenhum erro ainda hoje.`);
    }

    await Setting.set('mistakes', --mistakes);
    await Setting.set(today, --sessionMistakes);

    let msg = `${name} foi redimido.`;
    if (mistakes > 0) {
      msg += ` Ele já fez merda ${mistakes} vezes, `
        + (sessionMistakes > 0 ? `sendo ${sessionMistakes} só hoje.` : `mas nenhuma hoje.`);
    }

    await send('newMistake', { mistakes, sessionMistakes });
    return await iface.send(channel, msg);
  }

  if (mistakes > 0) {
    const msg = `${name} já fez merda ${mistakes} vezes` +
      (sessionMistakes > 0 ? `, sendo ${sessionMistakes} só hoje.` : ' mas hoje ainda está ileso.');
    return await iface.send(channel, msg);
  }
  return await iface.send(channel, `${name} ainda não fez nenhuma merda.`);
};
