const moment = require('moment');
moment.locale('pt-br');

const Command = require('../Command');
const AlreadyRedeemedError = require('../../models/AlreadyRedeemedError');
const User = require('../../models/User');

class DailyCommand extends Command {
  async handle() {
    try {
      const { sols, bonus } = await this.user.daily();
      const msg = [`você recebeu :sun_with_face: **${sols}**`];
      if (bonus > 0) {
        msg.push(`e :coin: **${bonus}**`);
      }
      return await this.reply(`${msg.join(' ')}!`);
    } catch (err) {
      if (err instanceof AlreadyRedeemedError) {
        const nextSlot = moment(err.nextSlot).fromNow();
        return await this.reply(`você já pegou seu daily hoje. Você pode pegar de novo ${nextSlot}.`);
      }
      console.log('Error on daily', err);
      throw err;
    }
  }
}

const Daily = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  await new DailyCommand({ iface, channel, userName, message, rawMessage }).run();
};
Daily.interfaces = ['discord'];

module.exports = Daily;
