/* eslint-disable no-console */
const Raffle = require('./models/Raffle');

const channelName = process.env.TWITCH_CHANNEL;
const twitch = require('./TwitchClient');

module.exports = async io => {
  const client = await twitch.connect();

  io.on('connection', socket => {
    console.log('Client connected');

    socket.on('winner', async name => {
      const raffle = await Raffle.open();
      if (!raffle) return console.warn('No current raffle trying to set winner as', name);

      console.log('Current raffle', raffle);
      await raffle.setWinner(name);
      client.action(channelName, `O ganhador do sorteio ${raffle.name} foi ${name}. Parabéns!!!`);
    });
  });
};
