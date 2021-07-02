const { expect } = require('chai');

const { readFixture } = require('./Utils');
const ClackSpawner = require('../src/ClackSpawner');
const Session = require('../src/models/Session');

xdescribe('ClackSpawner', () => {
  describe(`when the channel isn't active`, () => {
    let spawner;
    const client = {};
    const discord = {};
    const twitch = {
      getCurrentStream: () => Promise.resolve(false),
    };

    beforeEach(async () => {
      spawner = new ClackSpawner(client, discord, twitch);
    });

    it('does nothing', async () => {
      await spawner.check();
    });
  });

  describe('when the channel is active', async () => {
    const client = {};
    const discord = {};
    const twitch = {
      getCurrentStream: () => Promise.resolve(readFixture('twitch-getcurrentstream')),
    };
    const spawner = new ClackSpawner(client, discord, twitch);

    describe(`when the channel wasn't active`, async () => {
      it('sends a notification to Discord', async () => {
        const channel = {};
        discord.channels = {
          cache: { [process.env.DISCORD_ANNOUNCE_CHANNEL]: channel },
        };

        let first = true;
        const twitch = {
          getCurrentStream: () => {
            const res = first
              ? Promise.resolve(false)
              : Promise.resolve(readFixture('twitch-getcurrentstream'));
            first = false;
            return res;
          },
        };
        const spawner = new ClackSpawner(client, discord, twitch);
        await spawner.check();
        await spawner.check();
      });
    });

    describe('when there are no sessions', async () => {
      it('creates a new session', async () => {
        const prevCount = parseInt((await Session.query().count())[0].count, 10);
        await spawner.check();
        const count = parseInt((await Session.query().count())[0].count, 10);
        expect(count).to.eql(prevCount + 1);
      });
    });
  });
});
