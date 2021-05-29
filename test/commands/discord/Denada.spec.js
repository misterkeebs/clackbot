const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const denada = require('../../../src/commands/discord/Denada');
const User = require('../../../src/models/User');

describe('Denada', () => {
  beforeEach(() => iface.reset());

  describe('when used alone', async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', discordId: '399970540586270721', discordWannabe: 'user#0001' });
      await User.query().insert({ displayName: 'felipe', discordId: '399970540586270722' });
      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await denada(iface, {
        channel: 'channel',
        user: 'user',
        message: 'denada <!@399970540586270722>',
        rawMessage,
      });
    });

    it('sends a message with instructions', async () => {
      expect(iface.lastMessage).to.eql('se você acha que <@!399970540586270721> te ajudou, você pode doar sols para ele usando `!doar <sols> @user#0001`.');
    });

    it('sends the message to the receiving user', async () => {
      expect(iface.lastReceiver.displayName).to.eql('felipe');
    });
  });
});
