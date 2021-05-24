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
    describe('and has no clacks', async () => {
      it('sends a friendly message', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 0 });
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você ainda não tem clacks, fique esperto na próxima rodada!');
      });
    });

    describe('and has clacks', async () => {
      it('sends number of clacks', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 10 });
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você já tem :coin: 10.');
      });
    });
  });

  describe('on Discord', async () => {
    describe('when has no clacks', async () => {
      it('sends a friendly message', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 0 });
        iface.name = 'discord';
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você ainda não tem clacks, assista os streams no Twitch para ganhar!');
      });
    });

    describe('when has clacks', async () => {
      it('sends number of clacks', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 10 });
        iface.name = 'discord';
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você já tem :coin: 10.');
      });
    });

    describe('when has sols', async () => {
      it('sends number of sols', async () => {
        await User.query().insert({ displayName: 'felipe', sols: 10 });
        iface.name = 'discord';
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você já tem :sun_with_face: 10.');
      });
    });

    describe('when has clacks and sols', async () => {
      it('sends number of both', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        iface.name = 'discord';
        await clacks(iface, { channel: 'channel', user: 'felipe' });
        expect(iface.lastMessage).to.eql('você já tem :coin: 8 e :sun_with_face: 2.');
      });
    });
  });

  describe(`checking someone else's clacks`, async () => {
    describe('when user has clacks and sols', async () => {
      it('sends number of both', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        await User.query().insert({ displayName: 'user', bonus: 20, sols: 1 });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks user',
        });
        expect(iface.lastMessage).to.eql('user já tem :coin: 20 e :sun_with_face: 1.');
      });
    });

    describe('when user has clacks but not sols', async () => {
      it('sends number of both', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        await User.query().insert({ displayName: 'user', bonus: 20 });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks user',
        });
        expect(iface.lastMessage).to.eql('user já tem :coin: 20.');
      });
    });

    describe('when user has sols but not clacks', async () => {
      it('sends number of sols', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        await User.query().insert({ displayName: 'user', sols: 20 });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks user',
        });
        expect(iface.lastMessage).to.eql('user já tem :sun_with_face: 20.');
      });
    });

    describe(`when user doesn't have clacks`, async () => {
      it('sends an error message', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        await User.query().insert({ displayName: 'user' });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks user',
        });
        expect(iface.lastMessage).to.eql('user ainda não tem clacks.');
      });
    });

    describe(`when user doesn't exists`, async () => {
      it('sends an error', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks user',
        });
        expect(iface.lastMessage).to.eql('ainda não conheço o usuário user.');
      });
    });

    describe('using Discord id', async () => {
      it('sends the information', async () => {
        await User.query().insert({ displayName: 'felipe', bonus: 8, sols: 2 });
        await User.query().insert({ displayName: 'user', discordId: '12345', sols: 20 });
        iface.name = 'discord';
        await clacks(iface, {
          channel: 'channel',
          user: 'felipe',
          message: 'clacks <@!12345>',
        });
        expect(iface.lastMessage).to.eql('<@!12345> já tem :sun_with_face: 20.');
      });
    });
  });
});
