const moment = require('moment');
const fs = require('fs');
const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const Session = require('../../src/models/Session');

const pegar = require('../../src/commands/Pegar');
const User = require('../../src/models/User');
const iface = new FakeInterface();

describe('Pegar', () => {
  beforeEach(() => iface.reset());

  describe('when there is no running session', () => {
    it('returns no session', async () => {
      await pegar(iface, {
        channel: 'channel',
        user: 'user',
        message: '!pegar',
        userData: {},
      });

      expect(iface.lastMessage).to.eql('não existem clacks disponíveis ainda, aguarde!');
    });
  });

  describe('when there is a running session', () => {
    let session;

    beforeEach(async () => {
      session = await Session.query().insertAndFetch({
        bonus: 10,
        startsAt: moment().add(-2, 'minutes'),
        endsAt: moment().add(2, 'days'),
        processedAt: moment(),
      });
    });

    describe('when user already collected bonus from this session', () => {
      beforeEach(async () => {
        await pegar(iface, { channel: 'channel', user: 'user', message: '!pegar', userData: {} });
        await pegar(iface, { channel: 'channel', user: 'user', message: '!pegar', userData: {} });
      });

      it('sends a message informing the user', () => {
        expect(iface.lastMessage).to.eql('você já participou dessa rodada, aguarde a próxima!');
      });

      it(`doesn't change the user's bonus`, async () => {
        const [ user ] = await User.query().where('displayName', 'user');
        expect(user.bonus).to.eql(10);
      });
    });

    describe(`when user isn't a sub`, () => {
      beforeEach(async () => {
        await pegar(iface, {
          channel: 'channel',
          user: 'user',
          message: '!pegar',
          userData: {},
        });
      });

      it('sends a message with total clacks', async () => {
        expect(iface.lastMessage).to.eql('você pegou 10 clack(s)! Você agora tem um total de 10.');
      });

      it('adds bonus to user', async () => {
        const [ user ] = await User.query().where('displayName', 'user');
        expect(user.bonus).to.eql(10);
      });

      it('sets the last session id', async () => {
        const [ user ] = await User.query().where('displayName', 'user');
        expect(user.lastSessionId).to.eql(session.id);
      });
    });

    describe('when user is a sub', () => {
      beforeEach(async () => {
        await pegar(iface, {
          channel: 'channel',
          user: 'user',
          message: '!pegar',
          userData: { subscriber: true },
        });
      });

      it('sends a message with double total clacks', async () => {
        expect(iface.lastMessage).to.eql('obrigado por ser um inscrito! Por conta disso, você pegou 20 clack(s)! Você agora tem um total de 20.');
      });

      it('adds 2x bonus to user', async () => {
        const [ user ] = await User.query().where('displayName', 'user');
        expect(user.bonus).to.eql(20);
      });
    });

    describe('when user is a founder', async () => {
      beforeEach(async () => {
        await pegar(iface, {
          channel: 'channel',
          user: 'user',
          message: '!pegar',
          userData: JSON.parse(fs.readFileSync('./test/fixtures/founder-message.json')),
        });
      });

      it('sends a message with double total clacks', async () => {
        expect(iface.lastMessage).to.eql('obrigado por ser um inscrito! Por conta disso, você pegou 20 clack(s)! Você agora tem um total de 20.');
      });

      it('adds 2x bonus to user', async () => {
        const [ user ] = await User.query().where('displayName', 'user');
        expect(user.bonus).to.eql(20);
      });
    });
  });
});
