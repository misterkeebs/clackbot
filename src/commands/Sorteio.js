const _ = require('lodash');

const Raffle = require('../models/Raffle');
const Message = require('../models/Message');
const User = require('../models/User');
const { send, isModOnTwitch } = require('../Utils');

const AlreadyRaffledError = require('../models/AlreadyRaffledError');
const NotEnoughBonusError = require('../models/NotEnoughBonusError');
const NoUserError = require('../models/NoUserError');

module.exports = async (iface, { channel, user, message, userData }) => {
  const isMod = isModOnTwitch(userData);

  const raffle = await Raffle.current();
  const parts = message.split(' ');
  parts.shift();

  const tickets = parseInt(parts[0], 10);
  const hasClacks = !isNaN(tickets);
  if (parts.length === 0 || hasClacks || !isMod) {
    if (!raffle) {
      const [ nextRaffle ] = await Message.query().where('key', 'sorteio');
      if (!nextRaffle) {
        return iface.reply(channel, user, `nenhum sorteio ativo no momento.`);
      }
      return iface.reply(channel, user, nextRaffle.value);
    }

    if (hasClacks) {
      if (tickets < 0) {
        const [ dbUser ] = await User.query().where('displayName', user);
        await dbUser.$query().patch({ bonus: 0 });
        return iface.reply(channel, user, 'você é muito engraçadinho, acabou de perder todas suas clacks.');
      }

      if (tickets === 0) {
        return iface.reply(channel, user, 'você precisa dizer quantas clacks quer investir nesse sorteio com !sorteio <numero-de-clacks>.');
      }

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
    const duration = parseInt(parts.shift(), 10);
    if (parts.length < 1 || isNaN(duration)) {
      return iface.reply(channel, user, 'use !sorteio criar <duração em minutos> <nome>.');
    }
    const openRaffle = await Raffle.open();
    if (openRaffle) return iface.reply(channel, user, `já existe sorteio aberto - ${openRaffle.name}`);
    const name = parts.join(' ');
    const raffle = await Raffle.create(name, duration);
    return iface.reply(channel, user, `sorteio ${raffle.name} criado e aberto por ${duration} minutos! Mande !sorteio <clacks> para participar!`);
  }

  if (cmd.toLowerCase() === 'rodar') {
    const openRaffle = await Raffle.open();
    if (!openRaffle) return iface.reply(channel, user, 'não existe sorteio aberto no momento.');
    const rows = await openRaffle.$relatedQuery('players');
    const players = _(rows.map(p => [...Array(p.tickets)].map(_ => p.name)))
      .flatten().shuffle().value();
    await send('startRaffle', { players });
    iface.reply(channel, user, 'iniciando abertura do sorteio.');
    return;
  }

  if (cmd.toLowerCase() === 'escolher') {
    if (!raffle) return iface.reply(channel, user, 'não existe sorteio aberto no momento.');

    try {
      const winnerName = await raffle.run();
      return iface.reply(channel, user, `o sorteado foi ${winnerName}! Parabéns!`);
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
