const BotInterface = require('../src/BotInterface');
const { expect } = require('chai');

class SampleInterface extends BotInterface {
  constructor(bot) {
    super(bot);
  }

  handleConnection() {
    this.connected = true;
    return Promise.resolve();
  }
}

describe('BotInterface', () => {
  it('handles connection', async () => {
    const bot = {};
    const iface = new SampleInterface(bot);
    await iface.connect();
    expect(iface.connected).to.be.true;
  });
});
