const moment = require('moment');
const { expect } = require('chai');
const tk = require('timekeeper');

const gb = require('../../../src/commands/discord/GroupBuy');
const User = require('../../../src/models/User');
const GroupBuy = require('../../../src/models/GroupBuy');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

describe('GroupBuy', () => {
  beforeEach(async () => {
    await User.query().insert({ displayName: 'user' });
  });

  describe('formatMulti', async () => {
    it('handles kv pair', async () => {
      const res = gb.formatMulti('Base: 134.99, Novelties: 49.99');
      expect(res).to.eql('> Base: 134.99\n> Novelties: 49.99');
    });

    it('handles kv pair with kv pairs', async () => {
      const res = gb.formatMulti('USA: TheKeyCompany: https://tkc, Other: MrKeebs: https://xxx');
      expect(res).to.eql('USA\n> TheKeyCompany\n> https://tkc\nOther\n> MrKeebs\n> https://xxx');
    });
  });

  describe('with no params', async () => {
    beforeEach(async () => {
      await new gb({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'gb',
      }).run();
    });

    it('sends an error', async () => {
      expect(iface.lastMessage).to.eql('use `!gb <pesquisa>`. Para mais informações sobre como doações funcionam use !ajuda gb.');
    });
  });

  describe('with a search term', async () => {
    describe('with one hit', async () => {
      it('sends the hit', async () => {

      });
    });

    describe('with multiple hits', async () => {
      it('sends the hits for user to decide', async () => {

      });
    });
  });
});
