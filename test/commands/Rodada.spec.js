const { expect } = require('chai');
const moment = require('moment');

const FakeInterface = require('./FakeInterface');
const iface = new FakeInterface();

const Session = require('../../src/models/Session');
const rodada = require('../../src/commands/Rodada');

describe('Rodada', () => {
  beforeEach(() => iface.reset());

  describe('when there are no running sessions', () => {
    beforeEach(async () => {
      await rodada(iface, { channel: 'channel', user: 'user', message: '!rodada', userData: {} });
    });

    it('notifies the user', () => {
      expect(iface.lastMessage).to.eql('nenhuma rodada em andamento.');
    });
  });

  describe('when there is a running session', () => {
    beforeEach(async () => {
      await Session.query().insertAndFetch({
        bonus: 10,
        startsAt: moment().add(-2, 'minutes'),
        endsAt: moment().add(1, 'minutes'),
        processedAt: moment(),
      });

      await rodada(iface, { channel: 'channel', user: 'user', message: '!rodada', userData: {} });
    });

    it('notifies the user', () => {
      expect(iface.lastMessage).to.eql('rodada em andamento por menos de um minuto.');
    });
  });

  describe('when the create command is used', () => {
    describe(`when user isn't a mod`, () => {
      beforeEach(async () => {
        await rodada(iface, { channel: 'channel', user: 'user', message: '!rodada criar', userData: {} });
      });

      it('sends the regular message', () => {
        expect(iface.lastMessage).to.eql('nenhuma rodada em andamento.');
      });
    });

    describe('when user is a mod', () => {
      describe('with no running session', () => {
        let sessions;

        beforeEach(async () => {
          await rodada(iface, { channel: 'channel', user: 'user', message: '!rodada criar', userData: { mod: true } });
          sessions = await Session.query();
        });

        it('responds indicating a new session will be created', () => {
          expect(iface.lastMessage).to.eql('criando nova rodada...');
        });

        it('creates a new session', async () => {
          expect(sessions.length).to.eql(1);
        });

        it(`doesn't set the session processedAt`, () => {
          expect(sessions[0].processedAt).to.be.null;
        });
      });

      describe('with a running session', () => {
        beforeEach(async () => {
          await Session.query().insertAndFetch({
            bonus: 10,
            startsAt: moment().add(-2, 'minutes'),
            endsAt: moment().add(1, 'minutes'),
          });

          await rodada(iface, { channel: 'channel', user: 'user', message: '!rodada criar', userData: { mod: true } });
        });

        it('sends an error message', () => {
          expect(iface.lastMessage).to.include('rodada em andamento');
        });
      });
    });
  });
});

