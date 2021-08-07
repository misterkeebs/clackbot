const { expect } = require('chai');

const BuySellAction = require('../../src/actions/BuySellAction');
const User = require('../../src/models/User');
const FakeDiscordMessage = require('../FakeDiscordMessage');

describe('BuySellAction', async () => {
  describe('on initial state', async () => {
    let msg, action;

    beforeEach(async () => {
      const user = await User.query().insert({ displayName: 'user', discordId: '123456' });
      action = new BuySellAction(user);
      msg = new FakeDiscordMessage('teste');
      await action.run(msg);
    });

    it('asks the number of items to sell', async () => {
      expect(msg.lastDirectMessage).to.eql('Quantos itens vc quer vender? (De 1 a 6)');
    });

    it('saves the current state', async () => {
      const user = await User.query().where('displayName', 'user').first();
      const { state: { action, state, data } } = user;
      expect(action).to.eql('buySell');
      expect(state).to.eql(1);
      expect(data).to.eql({});
    });
  });

  describe('waiting for number of items', async () => {
    let msg, action;

    beforeEach(async () => {
      const user = await User.query().insert({ displayName: 'user', discordId: '123456' });
      action = new BuySellAction(user);
      await action.run(FakeDiscordMessage.create('vender'));

      msg = FakeDiscordMessage.createDirect('1');
      await action.run(msg);
    });

    it('asks the title for the first item', async () => {
      expect(msg.lastDirectMessage).to.eql('Qual o título do item 1?');
    });

    it('saves the current state', async () => {
      const user = await User.query().where('displayName', 'user').first();
      const { state: { action, state, data } } = user;
      expect(action).to.eql('buySell');
      expect(state).to.eql(2);
      expect(data.currentItem).to.eql(1);
      expect(data.items).to.eql([]);
      expect(data.numItems).to.eql(1);
    });
  });
});
