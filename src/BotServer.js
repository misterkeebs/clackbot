/* eslint-disable no-console */
const Bot = require('./Bot');
const TwitchInterface = require('./interfaces/TwitchInterface');

module.exports = async (twitch) => {
  const bot = new Bot();

  bot.registerInterface(new TwitchInterface(bot, twitch));

  bot.registerCommand('pegar', (iface, channel, user, _message) => {
    iface.reply(channel, user, `você pegou 10 clacks!`);
  });

  return bot.start().then(ifaces => {
    console.log(`Bot started with ${ifaces.length} interfaces`);
  }).catch(err => {
    console.error('Error starting bot', err);
  });
};
