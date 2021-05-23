const moment = require('moment');

const AlreadyRedeemedError = require('../../models/AlreadyRedeemedError');
const User = require('../../models/User');

const Daily = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  const [user] = await User.query().where('displayName', userName);

  try {
    const { sols, bonus } = await user.daily();
    const msg = [`você recebeu :sun_with_face: **${sols}**`];
    if (bonus > 0) {
      msg.push(`e :coin: **${bonus}**`);
    }
    return await iface.reply(channel, userName, `${msg.join(' ')}!`);
  } catch (err) {
    if (err instanceof AlreadyRedeemedError) {
      moment.locale('pt-br');
      const nextSlot = moment(err.nextSlot).fromNow();
      return await iface.reply(channel, userName, `você já pegou seu daily hoje. Você pode pegar de novo ${nextSlot}.`);
    }
    console.log('Error on daily', err);
    throw err;
  }
};
Daily.interfaces = ['discord'];

module.exports = Daily;
