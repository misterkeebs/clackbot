const { expect } = require('chai');

const FakeMessage = require('../FakeDiscordMessage');

const BuySell = require('../../src/processors/BuySell');

describe('messaging a buy and sell channel', () => {
  describe(`when message isn't valid`, async () => {
    let msg;

    beforeEach(async () => {
      msg = new FakeMessage('alguma coisa', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
    });

    it('deletes the message', async () => {
      expect(msg).to.have.property('deleted', true);
    });

    it('messages the user of valid actions', async () => {
      expect(msg.lastDirectMessage).to.match(/Para comprar ou vender algo no canal #canal/);
    });
  });
});

xdescribe('messaging a buy and sell channel', () => {
  describe(`when message doesn't start with the right prefix`, () => {
    it('sends the generic error message', async () => {
      const msg = new FakeMessage('vendo Tada68', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.include('Pedimos que vc edite ou apague sua mensagem e use o formato explicado abaixo.');
    });
  });

  describe(`when selling without a price`, () => {
    it('sends an error message telling the user to add price', async () => {
      const msg = new FakeMessage('WTS Tada68', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.include('Para vender alguma coisa, é necessário informar o preço ao final da mensagem');
    });
  });

  describe(`with multiple lines but one without price`, () => {
    it('sends an error message telling the user to add price', async () => {
      const msg = new FakeMessage('WTS Tada68 R$100\nWTB Philco\nWTS Something\nABC', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.include('Para vender alguma coisa, é necessário informar o preço ao final da mensagem');
    });
  });

  describe(`with multiple lines but first with no correct format`, () => {
    it('sends no error message', async () => {
      const msg = new FakeMessage('Produto em bom estado\nWTS Tada68 R$100\nPintado', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.be.include('Pedimos que vc edite ou apague sua mensagem e use o formato explicado abaixo.');
    });
  });

  describe(`with multiple lines and first starting with a correct format`, () => {
    it('sends no error message', async () => {
      const msg = new FakeMessage('WTS Tada68 R$100\nProduto em bom estado\nPintado', { channelName: 'canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.be.undefined;
    });
  });

  describe('message to another channel', async () => {
    it('sends no error message', async () => {
      const msg = new FakeMessage('WTS Tada68', { channelName: 'outro-canal' });
      await new BuySell('canal').handle(msg);
      expect(msg.lastDirectMessage).to.be.undefined;
    });
  });
});
