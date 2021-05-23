const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const resgatar = require('../../../src/commands/discord/Resgatar');
const User = require('../../../src/models/User');
const RedeemableCode = require('../../../src/models/RedeemableCode');

describe.only('Resgatar', () => {
  beforeEach(() => iface.reset());

  describe(`when there are no codes left`, async() => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', bonus: 51 });
      // await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('não existem mais códigos disponíveis.');
    });
  });

  describe.only(`when user has enough clacks`, async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', bonus: 49 });
      await RedeemableCode.query().insert({ code: 'ABC123' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('você não tem 50 clacks para resgatar.');
    });
  });
});
