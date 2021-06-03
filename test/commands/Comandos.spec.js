const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const iface = new FakeInterface();

const Comandos = require('../../src/commands/Comandos');
const User = require('../../src/models/User');

class Test {
  description = 'a test command';
  interfaces = ['discord', 'twitch'];
}

describe.only('Comandos', () => {
  beforeEach(async () => {
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
  });

  describe('when used in Twitch', async () => {
    beforeEach(async () => {
      iface.name = 'twitch';

      await new Comandos({
        iface,
        channel: 'channel',
        user: 'user',
        message: 'comandos',
      }).run();
    });

    it('returns the ordered list', async () => {
      expect(iface.lastMessage).to.eql('comandos disponíveis: classCmd, defaultCmd, mixCmd, twitchCmd');
    });
  });

  describe('when used in Discord', async () => {
    beforeEach(async () => {
      iface.name = 'discord';
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
      const parts = iface.lastMessage
        .split('\n')
        .map(m => m.replace(/`/g, ''))
        .map(m => m.split(' - ')[0]);
      const commands = parts.slice(2);
      expect(commands.join(',')).to.eql('classCmd,discordCmd1,discordCmd2,mixCmd');
    });

    it('shows commands descriptions when available', async () => {
      expect(iface.lastMessage).to.include('`classCmd` - a test command');
    });
  });
});
