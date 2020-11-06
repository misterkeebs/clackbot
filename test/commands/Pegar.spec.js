const moment = require('moment');
const { expect } = require('chai');

const knex = require('../../src/config/db');
const FakeInterface = require('./FakeInterface');
const Session = require('../../src/models/Session');

const pegar = require('../../src/commands/Pegar');
const iface = new FakeInterface();

describe('Pegar', () => {
  let transaction;

  before(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
  });

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
    beforeEach(async () => {
      await Session.query().insertAndFetch({
        bonus: 10,
        startsAt: moment().add(-2, 'minutes'),
        endsAt: moment().add(2, 'days'),
        processedAt: moment(),
      });
    });

    it('returns', async () => {
      await pegar(iface, {
        channel: 'channel',
        user: 'user',
        message: '!pegar',
        userData: {},
      });

      expect(iface.lastMessage).to.eql('você pegou 10 clack(s)! Você agora tem um total de 10.');
    });
  });
});
