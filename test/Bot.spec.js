const { expect } = require('chai');

const Bot = require('../src/Bot');

describe('Bot', () => {
  it('handles commands', () => {
    let theMessage = null;
    const iface = {};

    const bot = new Bot();
    bot.registerCommands({
      pegar: (iface, { message }) => theMessage = message,
    });
    bot.handleMessage(iface, {
      channel: 'srteclados',
      user: 'fcoury',
      message: '!pegar',
    });

    expect(theMessage).to.eql('!pegar');
  });
});
