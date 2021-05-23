const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const resgatar = require('../../../src/commands/discord/Resgatar');
const User = require('../../../src/models/User');
const RedeemableCode = require('../../../src/models/RedeemableCode');

describe.only('Resgatar', () => {
  beforeEach(() => iface.reset());

  describe(`when there are no codes left`, async () => {
    beforeEach(async () => {
      let lastMessage;
      await User.query().insert({ displayName: 'user', bonus: 51 });

      const rawMessage = {};
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('não existem mais códigos disponíveis.');
    });
  });

  describe(`when user doesn't have enough clacks`, async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', bonus: 49 });

      const rawMessage = {};
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends error message', async () => {
      expect(iface.lastMessage).to.eql('você não tem 50 clacks para resgatar.');
    });
  });

  describe(`when user has enough clacks and code available`, async () => {
    beforeEach(async () => {
      await User.query().insert({ displayName: 'user', bonus: 51 });
      await RedeemableCode.query().insert({ code: 'ABC123' });

      const author = {
        send: msg => lastMessage = msg,
      };
      const rawMessage = {
        author,
      };
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends confirmation message on the channel', async () => {
      expect(iface.lastMessage).to.eql('obrigado por resgatar 50 clacks. Seu código para participar do sorteio foi enviado via DM.');
    });

    it('sends the code in private', async () => {
      expect(lastMessage).to.eql('Você resgatou 50 clacks e pode usar o código **ABC123** no sorteio atual.');
    });
  });

  describe('when user already claimed a code', async () => {
    beforeEach(async () => {
      const user = await User.query().insert({ displayName: 'user', bonus: 51 });
      await RedeemableCode.query().insert({ code: 'ABC123', redeemed_by: user.id });
      await RedeemableCode.query().insert({ code: 'DEF456' });

      const author = {
        send: msg => lastMessage = msg,
      };
      const rawMessage = {
        author,
      };
      await resgatar(iface, {
        channel: 'channel',
        user: 'user',
        message: 'resgatar',
        rawMessage,
      });
    });

    it('sends reply', async () => {
      expect(iface.lastMessage).to.eql('você já resgatou seu código. Caso não tenha recebido ainda, mande `!resgatar reenviar` para receber a DM novamente.');
    });
  });

  describe('resending', async () => {
    describe(`when user didn't claim a code before`, async () => {
      beforeEach(async () => {
        const user = await User.query().insert({ displayName: 'user', bonus: 51 });
        await RedeemableCode.query().insert({ code: 'DEF456' });

        const author = {
          send: msg => lastMessage = msg,
        };
        const rawMessage = {
          author,
        };
        await resgatar(iface, {
          channel: 'channel',
          user: 'user',
          message: 'resgatar reenviar',
          rawMessage,
        });
      });

      it('sends error message', async () => {
        expect(iface.lastMessage).to.eql('você não resgatou um código ainda.');
      });
    });

    describe('when user claimed a code before', async () => {
      beforeEach(async () => {
        const user = await User.query().insert({ displayName: 'user', bonus: 51 });
        await RedeemableCode.query().insert({ code: 'ABC123', redeemed_by: user.id });
        await RedeemableCode.query().insert({ code: 'DEF456' });

        const author = {
          send: msg => lastMessage = msg,
        };
        const rawMessage = {
          author,
        };
        await resgatar(iface, {
          channel: 'channel',
          user: 'user',
          message: 'resgatar reenviar',
          rawMessage,
        });
      });

      it('sends a reply', async () => {
        expect(iface.lastMessage).to.eql('seu código foi reenviado em DM.');
      });

      it('sends the DM message', async () => {
        expect(lastMessage).to.eql('Você resgatou 50 clacks e pode usar o código **ABC123** no sorteio atual.');
      });
    });
  });

  describe('left', async () => {
    describe(`when there are codes left`, async () => {
      beforeEach(async () => {
        const user = await User.query().insert({ displayName: 'user', bonus: 51 });
        await RedeemableCode.query().insert({ code: 'ABC123' });
        await RedeemableCode.query().insert({ code: 'DEF456' });

        const author = {
          send: msg => lastMessage = msg,
        };
        const rawMessage = {
          author,
        };
        await resgatar(iface, {
          channel: 'channel',
          user: 'user',
          message: 'resgatar quantos',
          rawMessage,
        });
      });

      it('sends message', async () => {
        expect(iface.lastMessage).to.eql('ainda temos 2 códigos disponíveis.');
      });
    });

    describe('when there are no codes left', async () => {
      beforeEach(async () => {
        const user = await User.query().insert({ displayName: 'user', bonus: 51 });
        await RedeemableCode.query().insert({ code: 'ABC123', redeemed_by: user.id });

        const author = {
          send: msg => lastMessage = msg,
        };
        const rawMessage = {
          author,
        };
        await resgatar(iface, {
          channel: 'channel',
          user: 'user',
          message: 'resgatar quantos',
          rawMessage,
        });
      });

      it('sends message', async () => {
        expect(iface.lastMessage).to.eql('todos os códigos já foram usados.');
      });
    });
  });
});
