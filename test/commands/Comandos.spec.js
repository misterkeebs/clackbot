const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const iface = new FakeInterface();

const Comandos = require('../../src/commands/Comandos');
const User = require('../../src/models/User');

class Test {
  interfaces = ['discord', 'twitch'];
}

describe.only('Comandos', () => {
  describe('when used in Discord', async () => {
    beforeEach(async () => {
      iface.name = 'discord';
      iface.bot = {
        handlers: {
          discordCmd2: { interfaces: ['discord'] },
          mixCmd: { interfaces: ['discord', 'twitch'] },
          discordCmd1: { interfaces: ['discord'] },
          twitchCmd: { interfaces: ['twitch'] },
          defaultCmd: {},
          classCmd: Test,
        }
      };
      await new Comandos({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'comandos',
      }).run();
    });

    it('precedes commands with a text', async () => {
      expect(iface.lastMessage).to.match(/^comandos disponíveis/);
    });

    it('shows a class command', async () => {
      expect(iface.lastMessage).to.include(`classCmd`);
    });

    it('shows discord only commands', async () => {
      expect(iface.lastMessage).to.include(`discordCmd1`);
      expect(iface.lastMessage).to.include(`discordCmd2`);
    });

    it('shows discord+twitch commands', async () => {
      expect(iface.lastMessage).to.include(`mixCmd`);
    });

    it('omits twitch commands', async () => {
      expect(iface.lastMessage).to.not.include(`twitchCmd`);
    });

    it('omits default commands', async () => {
      expect(iface.lastMessage).to.not.include(`defaultCmd`);
    });

    it('shows commands in order', async () => {
      const parts = iface.lastMessage.split('\n').map(m => m.replace(/`/g, ''));
      const commands = parts.slice(2);
      expect(commands.join(',')).to.eql('classCmd,discordCmd1,discordCmd2,mixCmd');
    });
  });
});
