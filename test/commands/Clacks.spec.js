const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const iface = new FakeInterface();

const clacks = require('../../src/commands/Clacks');
const User = require('../../src/models/User');

describe('Clacks', () => {
  beforeEach(() => iface.reset());

  describe(`when user doesn't exist`, () => {
    it('sends message', async () => {
      await clacks(iface, { channel: 'channel', user: 'user' });
      expect(iface.lastMessage).to.eql('você ainda não tem clacks, fique esperto na próxima rodada!');
    });
  });

  describe('when user exists', () => {
    it('sends number of clacks', async () => {
      await User.query().insert({ displayName: 'felipe', bonus: 10 });
      await clacks(iface, { channel: 'channel', user: 'felipe' });
      expect(iface.lastMessage).to.eql('você já tem 10 clacks.');
    });
  });
});
