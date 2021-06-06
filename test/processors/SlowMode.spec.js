const moment = require('moment');
const { expect } = require('chai');

const FakeMessage = require('../FakeDiscordMessage');
const SlowModeProcessor = require('../../src/processors/SlowMode');
const DiscordUser = require('../../src/models/DiscordUser');

describe('SlowModeProcessor', async () => {
  describe('handle', async () => {
    describe('when no channels are set', async () => {
      const msg = new FakeMessage('WTS Tada68', { channelName: 'canal' });
      const proc = new SlowModeProcessor();

      it('returns false', async () => {
        expect(await proc.handle(msg)).to.eql(false);
      });
    });

    describe('when channel is rate limited', async () => {
      const proc = new SlowModeProcessor('canal');

      describe(`when user didn't send a message on the interval`, async () => {
        const msg = new FakeMessage('WTS Tada68', {
          authorID: '12345',
          channelName: 'canal',
        });
        let res;

        beforeEach(async () => {
          res = await proc.handle(msg);
        });

        it('returns false', async () => {
          expect(res).to.eql(false);
        });

        it('creates a Discord user with the last announcement date set', async () => {
          const user = await DiscordUser.query().where('discordId', '12345').first();
          expect(user).to.not.be.undefined;
          expect(user.lastAnnounceAt).to.not.be.undefined;
        });
      });

      describe('when user sent a message inside the forbidden interval', async () => {
        let msg, res;

        beforeEach(async () => {
          msg = new FakeMessage('WTS Tada68', {
            authorID: '12345',
            channelName: 'canal',
          });
          const lastAnnounceAt = moment().add(-5, 'hours');
          await DiscordUser.query().insert({ discordId: '12345', lastAnnounceAt });
          res = await proc.handle(msg);
        });

        it('returns true to stop processing', async () => {
          expect(res).to.eql(true);
        });

        it('deletes the message', async () => {
          expect(msg.deleted).to.be.true;
        });

        it('sends a direct message to the user', async () => {
          expect(msg.directMessages).to.include('Sua mensagem no canal **#canal** foi excluída porque este canal permite apenas um envio a cada 6 horas. Você pode enviar a mensagem novamente em aproximadamente em uma hora.');
        });
      });
    });
  });

  describe('constructor', async () => {
    describe('when no params are passed', async () => {
      const proc = new SlowModeProcessor(null);

      it('sets channels as empty array', async () => {
        expect(proc.channels).to.be.undefined;
      });

      it('sets no intervals', async () => {
        expect(proc.intervals).to.be.undefined;
      });
    });

    describe('when channels are passed', async () => {
      const proc = new SlowModeProcessor('a,b,c');

      it('sets channels as empty array', async () => {
        expect(proc.channels).to.eql(['a', 'b', 'c']);
      });

      it('sets default intervals', async () => {
        expect(proc.intervals).to.eql({ a: 6, b: 6, c: 6 });
      });
    });

    describe('when channels and intervals are passed', async () => {
      const proc = new SlowModeProcessor('a|10,b|1,c|2');

      it('sets channels as empty array', async () => {
        expect(proc.channels).to.eql(['a', 'b', 'c']);
      });

      it('sets default intervals', async () => {
        expect(proc.intervals).to.eql({ a: 10, b: 1, c: 2 });
      });
    });
  });

  describe('parseChannels', async () => {
    const proc = new SlowModeProcessor();
    let res;

    describe('with string', async () => {
      it('returns channels', async () => {
        expect(proc.parseChannels('chanA|10,chanB,chanC|24')).to.eql([
          { channel: 'chanA', interval: 10 },
          { channel: 'chanB', interval: 6 },
          { channel: 'chanC', interval: 24 },
        ]);
      });
    });

    describe('with undefined', async () => {
      it('returns nothing', async () => {
        expect(proc.parseChannels()).to.be.undefined;
      });
    });
  });
});
