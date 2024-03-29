const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const Forca = require('../../../src/commands/discord/Forca');
const ForcaCmd = require('../../../src/commands/discord/ForcaCmd');
const User = require('../../../src/models/User');

describe('ForcaCmd', async () => {
  let forca;

  async function sendMessage(message, options = {}) {
    return await new ForcaCmd({
      iface,
      channel: 'channel',
      user: 'user',
      message,
      rawMessage: iface.rawMessage,
      ...options,
    }, options.forca || forca).run();
  }

  beforeEach(async () => {
    iface.reset();
    forca = new Forca();
    await User.query().insert({ displayName: 'user' });
  });

  describe('when there is no game in course', async () => {
    beforeEach(async () => {
      forca.pickWord = () => 'sambar';
      await sendMessage('forca');
    });

    it('starts a new game', async () => {
      expect(forca.isRunning()).to.be.true;
    });

    it('sends the word', async () => {
      expect(iface.lastChannelMessage).to.contain('_ _ _ _ _ _');
    });
  });

  describe('when there is a game in course', async () => {
    describe('with no guess bonus', async () => {
      beforeEach(async () => {
        forca.start('paçoca');
        await sendMessage('forca a', { guessBonus: 0, forca });
      });

      it('sends the message without the bonus', async () => {
        expect(iface.lastMessage).to.eql('existem 2 letras A na palavra.');
      });

      it('gives the user no clacks', async () => {
        const [user] = await User.query().where('displayName', 'user');
        expect(user.bonus).to.be.null;
      });
    });

    describe('when user sends a letter', async () => {
      describe('that matches more than one letter', async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca a');
        });

        it('accepts the letter if it exists', async () => {
          expect(iface.lastChannelMessage).to.include('_ A _ _ _ A');
        });

        it('replies to the user saying it guessed right and got bonus', async () => {
          expect(iface.lastMessage).to.eql('existem 2 letras A na palavra.');
        });
      });

      describe(`when user doesn't provide a letter to guess`, async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca a');
          await sendMessage('forca');
        });

        it('replies with an error', async () => {
          expect(iface.lastMessage).to.eql('faltou a letra... Use `!forca <letra>` para chutar uma letra.');
        });
      });

      describe('that matches one letter', async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca a');
          await sendMessage('forca p');
        });

        it('accepts the letter if it exists', async () => {
          expect(iface.lastChannelMessage).to.include('P A _ _ _ A');
        });

        it('replies to the user saying it guessed right and got no bonus', async () => {
          expect(iface.lastMessage).to.eql('existe 1 letra P na palavra.');
        });

        it('gives the user no clacks', async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.be.null;
        });
      });

      describe(`that doesn't match`, async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca x');
        });

        it('displays the empty word', async () => {
          expect(iface.lastChannelMessage).to.include('_ _ _ _ _ _');
        });

        it('replies to the user saying it guessed right and got bonus', async () => {
          expect(iface.lastMessage).to.eql('não existe nenhuma letra X na palavra. :cry:');
        });

        it(`doesn't give the user any bonuses`, async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.be.null;
        });
      });

      describe(`that was already guessed`, async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca x');
          await sendMessage('forca x');
        });

        it('displays the empty word', async () => {
          expect(iface.lastChannelMessage).to.include('_ _ _ _ _ _');
        });

        it('replies to the user saying the letter was already guessed', async () => {
          expect(iface.lastMessage).to.eql('a letra X já foi usada, tente outra.');
        });

        it(`doesn't give the user any bonuses`, async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.be.null;
        });
      });

      describe('and gets hanged', async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca x');
          await sendMessage('forca s');
          await sendMessage('forca t');
          await sendMessage('forca y');
          await sendMessage('forca u');
          await sendMessage('forca i');
        });

        it('replies to the user saying game over', async () => {
          expect(iface.lastMessage).to.eql(`você foi enforcado! A palavra era **PAÇOCA**. :skull:`);
        });
      });

      describe(`and guesses the word`, async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca p');
          await sendMessage('forca a');
          await sendMessage('forca c');
          await sendMessage('forca o');
        });

        it('displays the full word', async () => {
          expect(iface.lastChannelMessage).to.include('P A Ç O C A');
        });

        it('replies to the user saying he guessed the word', async () => {
          expect(iface.lastMessage).to.eql('você acertou a palavra e ganhou :coin: **1**. :heart:');
        });

        it(`doesn't give the user any bonuses`, async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.eql(1);
        });
      });
    });

    describe('when user sends a guess', async () => {
      describe('and misses', async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca pelota');
        });

        it('displays the full word', async () => {
          expect(iface.lastChannelMessage).to.include('P A Ç O C A');
        });

        it('replies to the user saying he was hung', async () => {
          expect(iface.lastMessage).to.eql('você foi enforcado! A palavra era **PAÇOCA**. :skull:');
        });

        it(`doesn't give the user any bonuses`, async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.be.null;
        });
      });

      describe('and guesses right', async () => {
        beforeEach(async () => {
          forca.start('paçoca');
          await sendMessage('forca paçoca');
        });

        it('displays the full word', async () => {
          expect(iface.lastChannelMessage).to.include('P A Ç O C A');
        });

        it('replies to the user saying he was hung', async () => {
          expect(iface.lastMessage).to.eql('você acertou a palavra e ganhou :coin: **1**. :heart:');
        });

        it(`doesn't give the user the win bonus`, async () => {
          const [user] = await User.query().where('displayName', 'user');
          expect(user.bonus).to.eql(1);
        });

        it('allows a new game to start', async () => {
          forca.pickWord = () => 'paçoca';
          await sendMessage('forca x');
          expect(iface.lastChannelMessage).to.include('_ _ _ _ _ _');
        });
      });
    });
  });
});
