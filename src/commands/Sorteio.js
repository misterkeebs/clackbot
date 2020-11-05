const AlreadyRaffledError = require('../models/AlreadyRaffledError');
const NotEnoughBonusError = require('../models/NotEnoughBonusError');
const NoUserError = require('../models/NoUserError');
const Raffle = require('../models/Raffle');

module.exports = async (iface, { channel, user, message, userData }) => {
  const isMod = userData.mod || userData.badges.broadcaster === '1';

  const raffle = await Raffle.current();
  const parts = message.split(' ');
  parts.shift();

  const tickets = parseInt(parts[0], 10);
  const hasClacks = !isNaN(tickets);
  if (parts.length === 0 || hasClacks || !isMod) {
    if (!raffle) {
      return iface.reply(channel, user, `nenhum sorteio ativo no momento.`);
    }

    if (hasClacks) {
      try {
        const theUser = await raffle.addPlayer(user, tickets);
        if (!theUser) {
          return iface.reply(channel, user, 'você já está participando.');
        }
        return iface.reply(channel, user, `você está participando com ${tickets} clacks. Você tem agora ${theUser.bonus} clacks.`);
      } catch (err) {
        if (err instanceof NoUserError) {
          return iface.reply(channel, user, `infelizmente você não tem clacks prá participar desse sorteio.`);
        }
        if (err instanceof NotEnoughBonusError) {
          return iface.reply(channel, user, `você não tem saldo suficiente prá participar com ${tickets} clacks. Use !clacks prá saber quantas vc tem.`);
        }

        // eslint-disable-next-line no-console
        console.error('Error adding user', user, 'to raffle', raffle, err);
        return iface.reply(channel, user, `ocorreu um erro ao tentar te adicionar no sorteio. O erro foi: ${err}`);
      }
    }

    const { name, timeLeft } = raffle;
    return iface.reply(channel, user, `estamos sorteando ${name}. O sorteio se encerra daqui ${timeLeft} minutos. Envie !sorteio <numero de clacks> para participar.`);
  }

  const cmd = parts.shift();
  if (cmd.toLowerCase() === 'criar') {
    if (parts.length < 2) {
      return iface.reply(channel, user, 'use !sorteio criar <nome> <duração em minutos>.');
    }
    const duration = parseInt(parts.shift(), 10);
    const name = parts.join(' ');
    const raffle = await Raffle.create(name, duration);
    return iface.reply(channel, user, `sorteio ${raffle.name} criado e aberto por ${duration} minutos!`);
  }

  if (cmd.toLowerCase() === 'rodar') {
    if (!raffle) return iface.reply(channel, user, 'não existe sorteio aberto no momento.');

    try {
      const winner = await raffle.run();
      return iface.reply(channel, user, `o sorteado foi ${winner.name}! Parabéns!`);
    } catch (err) {
      if (err instanceof AlreadyRaffledError) {
        return iface.reply(channel, user, `esse sorteio já foi rodado!`);
      }

      // eslint-disable-next-line no-console
      console.error('Error raffling', raffle, err);
      return iface.reply(channel, user, `ocorreu um erro rodar o sorteio: ${err}`);
    }
  }
};
