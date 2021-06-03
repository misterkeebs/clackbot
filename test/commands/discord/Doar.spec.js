const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const Doar = require('../../../src/commands/discord/Doar');
const User = require('../../../src/models/User');

describe('Doar', () => {
  beforeEach(() => iface.reset());

  describe('when command is correct', async () => {
    describe(`when receiving user isn't mentioned`, async () => {
      beforeEach(async () => {
        const mentions = new Map();
        const rawMessage = { mentions };
        await new Doar({
          iface,
          channel: 'channel',
          user: 'user',
          message: 'doar 2 felipe',
          rawMessage,
        }).run();
      });

      it('sends an error', async () => {
        expect(iface.lastMessage).to.eql('você precisa marcar o usuário para o qual quer doar: `!doar <sols> @<usuário>`.');
      });
    });

    describe('when receiving user is mentioned', async () => {
      describe(`but doesn't exist`, async () => {
        beforeEach(async () => {
          await User.query().insert({ displayName: 'user' });
          const users = new Map();
          users.set('399970540586270722', {
            id: '399970540586270722',
            username: 'felipe',
            discriminator: '0001',
          });
          const rawMessage = { mentions: { users } };
          await new Doar({
            iface,
            channel: 'channel',
            user: 'user',
            message: 'doar 2 felipe',
            rawMessage,
          }).run();
        });

        it('sends error message', async () => {
          expect(iface.lastMessage).to.eql('o usuário felipe não existe ou não está disponível para receber doações.');
        });
      });

      describe('and it exists', async () => {
        beforeEach(async () => {
          await User.query().insert({ displayName: 'user', sols: 3 });
          await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

          const users = new Map();
          users.set('399970540586270722', {
            id: '399970540586270722',
            username: 'felipe',
            discriminator: '0001',
          });
          const rawMessage = { mentions: { users } };
          await new Doar({
            iface,
            channel: 'channel',
            user: 'user',
            message: 'doar 3 felipe',
            rawMessage,
          }).run();
        });

        it('sends error message', async () => {
          expect(iface.lastMessage).to.eql('obrigado por doar 3 sols. O usuário felipe recebeu 2 clacks.');
        });

        it('adds the bonus to the receiver', async () => {
          const [receiver] = await User.query().where('displayName', 'felipe');
          expect(receiver.bonus).to.eql(3);
        });

        it('removes the sols from the donor', async () => {
          const [donor] = await User.query().where('displayName', 'user');
          expect(donor.sols).to.eql(0);
        });
      });
    });
  });

  describe('when user donates more than 5 sols', async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', sols: 12 });
      await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await new Doar({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'doar 5 felipe',
        rawMessage,
      }).run();
    });

    it('receives a kickback of 1 clack', async () => {
      const [sender] = await User.query().where('displayName', 'user');
      expect(sender.bonus).to.eql(1);
    });
  });

  describe('when user donates more than 10 sols', async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', sols: 12 });
      await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await new Doar({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'doar 10 felipe',
        rawMessage,
      }).run();
    });

    it('receives a kickback of 2 clacks', async () => {
      const [sender] = await User.query().where('displayName', 'user');
      expect(sender.bonus).to.eql(2);
    });
  });

  describe(`when user doesn't have anough sols`, async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', sols: 2 });
      await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await new Doar({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'doar 3 felipe',
        rawMessage,
      }).run();
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('você não tem 3 sols para doar.');
    });
  });

  describe(`when donating to him/herself`, async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'felipe', bonus: 1, discordId: '399970540586270722' });

      const users = new Map();
      users.set('399970540586270722', {
        id: '399970540586270722',
        username: 'felipe',
        discriminator: '0001',
      });
      const rawMessage = { mentions: { users } };
      await new Doar({
        iface,
        channel: 'channel',
        user: 'felipe',
        message: 'doar 3 felipe',
        rawMessage,
      }).run();
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('você não pode doar prá si mesmo.');
    });
  });

  describe(`when command has no params`, () => {
    beforeEach(async () => await new Doar({ iface, channel: 'channel', user: 'user', message: 'doar' }).run());
    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    });
  });

  describe(`when command has not enough params`, () => {
    beforeEach(async () => await new Doar({ iface, channel: 'channel', user: 'user', message: 'doar 8' }).run());
    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    });
  });

  describe(`when command is malformed`, () => {
    beforeEach(async () => await new Doar({ iface, channel: 'channel', user: 'user', message: 'doar x felipe' }).run());
    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    });
  });

  describe(`when trying to donate zero`, () => {
    beforeEach(async () => await new Doar({ iface, channel: 'channel', user: 'user', message: 'doar 0 felipe' }).run());
    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    });
  });

  describe(`when trying to donate a negative amount`, () => {
    beforeEach(async () => await new Doar({ iface, channel: 'channel', user: 'user', message: 'doar -1 felipe' }).run());
    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('use `!doar <sols> @<usuário>`. Para mais informações sobre como doações funcionam use !ajuda doar.');
    });
  });
});
