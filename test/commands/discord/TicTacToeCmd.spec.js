const _ = require('lodash');
const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const TicTacToe = require('../../../src/commands/discord/TicTacToe');
const TicTacToeCmd = require('../../../src/commands/discord/TicTacToeCmd');
const User = require('../../../src/models/User');

describe('TicTacToeCmd', async () => {
  let user1, user2;

  async function sendMessage(message, options = {}) {
    return await new TicTacToeCmd(_.merge(
      {},
      {
        iface,
        channel: 'channel',
        user: 'user1',
        message,
        rawMessage: iface.rawMessage,
      },
      options,
    )).run();
  };

  beforeEach(async () => {
    iface.reset();
    user1 = await User.query().insert({ displayName: 'user1', discordId: '123456' });
    user2 = await User.query().insert({ displayName: 'user2', discordId: '987654' });
  });

  describe('with no game', async () => {
    describe('with no params', async () => {
      it('sends an error message', async () => {
        await sendMessage('velha');
        expect(iface.lastMessage).to.eql('você tem que convidar alguém. Use `!velha <@convidado>` para jogar. Para mais informações use `!ajuda velha`.');
      });
    });

    describe('when player invites another player', async () => {
      beforeEach(async () => {
        const users = new Map();
        users.set('987654', {
          id: '987654',
          username: 'user2',
          discriminator: '0001',
        });
        const rawMessage = { mentions: { users } };
        await sendMessage(`velha <@!${user2.discordId}>`, { rawMessage });
      });

      it('sends a message to the other player', async () => {
        expect(iface.lastMessage).to.eql('o usuário <@!123456> está te convidando para uma partida de jogo da velha. Para aceitar digite `!velha aceito`.');
      });

      describe('and user accepts', async () => {
        beforeEach(async () => {
          await sendMessage('velha aceito', { user: 'user2' });
        });

        it('sends a message to the other player', async () => {
          expect(iface.lastMessage).to.eql('<@!123456> seu convite foi aceito! Começando novo jogo...');
        });

        it('sends the start game message', async () => {
          expect(iface.lastChannelMessage).to.eql('<@!123456> é sua vez, mande a coordenada desejada.');
        });
      });
    });
  });
});
