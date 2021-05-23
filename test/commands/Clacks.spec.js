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
});
