/* eslint-disable no-console */
const Bot = require('./Bot');
const TwitchInterface = require('./interfaces/TwitchInterface');

module.exports = async (twitch) => {
  const bot = new Bot();

  bot.registerInterface(new TwitchInterface(bot, twitch));
  bot.registerCommands({
    pegar: require('./commands/Pegar'),
  });

  return bot.start().then(ifaces => {
    console.log(`Bot started with ${ifaces.length} interfaces`);
  }).catch(err => {
    console.error('Error starting bot', err);
  });
};
