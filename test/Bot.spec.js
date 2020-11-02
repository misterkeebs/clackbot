const { expressJwtSecret } = require('jwks-rsa');
const Bot = require('../src/Bot');
const { expect } = require('chai');

describe('Bot', () => {
  it('handles commands', () => {
    let message = null;
    const iface = {};

    const bot = new Bot();
    bot.registerCommand('pegar', (_i, _c, _u, msg) => message = msg);
    bot.handleMessage(iface, 'srteclados', 'fcoury', '!pegar');

    expect(message).to.eql('!pegar');
  });
});
