/* eslint-disable no-console */
const Bot = require('./Bot');
const DiscordInterface = require('./interfaces/DiscordInterface');
const TwitchInterface = require('./interfaces/TwitchInterface');

module.exports = async (twitch, discord) => {
  const bot = new Bot();

  bot.registerInterface(new TwitchInterface(bot, twitch));
  bot.registerInterface(new DiscordInterface(bot, discord));
  bot.registerCommands({
    pegar: require('./commands/Pegar'),
    clacks: require('./commands/Clacks'),
    rodada: require('./commands/Rodada'),
    sorteio: require('./commands/Sorteio'),
    eusou: require('./commands/EuSou'),
    wpm: require('./commands/Wpm'),

    doar: require('./commands/discord/Doar'),
    gb: require('./commands/discord/GroupBuys'),
    gbs: require('./commands/discord/GroupBuys'),
    vid: require('./commands/discord/Vid'),
  });

  return bot.start().then(ifaces => {
    console.log(`Bot started with ${ifaces.length} interfaces`);
  }).catch(err => {
    console.error('Error starting bot', err);
  });
};
