const moment = require('moment');
const tk = require('timekeeper');
const { expect } = require('chai');

const FakeMessage = require('../discord/Message');
const SlowModeProcessor = require('../../src/processors/SlowMode');
const DiscordUser = require('../../src/models/DiscordUser');
const UserLastMessage = require('../../src/models/UserLastMessage');

describe('SlowModeProcessor', async () => {
  describe('handle', async () => {
    describe('when no channels are set', async () => {
      const msg = new FakeMessage('WTS Tada68', { channelName: 'canal' });
      const proc = new SlowModeProcessor();

      it('returns false', async () => {
        expect(await proc.handle(msg)).to.eql(false);
      });
    });

    describe('when multiple channels are rate limited', async () => {
      const proc = new SlowModeProcessor('canal1,canal2');

      beforeEach(() => tk.freeze(1605576014801));
      afterEach(() => tk.reset());

      describe('when user sends a message on each channel within the allowed interval', async () => {
        const msg1 = new FakeMessage('WTS Tada68', {
          authorID: '12345',
          channelName: 'canal1',
        });

        const msg2 = new FakeMessage('WTS Tada68', {
          authorID: '12345',
          channelName: 'canal2',
        });

        let res;

        beforeEach(async () => {
          await proc.handle(msg1);
          res = await proc.handle(msg2);
        });

        it('returns false', async () => {
          expect(res).to.eql(false);
        });

        it('tracks last message for first channel', async () => {
          const last1 = await UserLastMessage.for('12345', 'canal1');
          expect(last1.getTime()).to.eql(moment().valueOf());
        });

        it('tracks last message for the second channel', async () => {
          const last1 = await UserLastMessage.for('12345', 'canal2');
          expect(last1.getTime()).to.eql(moment().valueOf());
        });
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
          tk.freeze(1605576014801);
          res = await proc.handle(msg);
        });
        afterEach(() => tk.reset());

        it('returns false', async () => {
          expect(res).to.eql(false);
        });

        it('tracks the last message', async () => {
          const last1 = await UserLastMessage.for('12345', 'canal');
          expect(last1.getTime()).to.eql(moment().valueOf());
        });
      });

      describe('when user sent a message before the cooldown period', async () => {
        let msg, res;

        beforeEach(async () => {
          tk.freeze(1605576014801);
          msg = new FakeMessage('WTS Tada68', {
            authorID: '12345',
            channelName: 'canal',
          });
          await proc.handle(msg);
          res = await proc.handle(msg);
        });
        afterEach(() => tk.reset());

        it('returns true to stop processing', async () => {
          expect(res).to.eql(true);
        });

        it('deletes the message', async () => {
          expect(msg.deleted).to.be.true;
        });

        it('sends a direct message to the user', async () => {
          expect(msg.directMessages).to.include('Sua mensagem no canal **#canal** foi excluída porque este canal permite apenas um envio a cada 6 horas. Você pode enviar a mensagem novamente em aproximadamente em 6 horas.');
        });

        it('tracks the last message', async () => {
          const last1 = await UserLastMessage.for('12345', 'canal');
          expect(last1.getTime()).to.eql(moment().valueOf());
        });
      });

      describe('when user sent a message after the interval', async () => {
        let msg, res, initialAnnDate;

        beforeEach(async () => {
          tk.freeze(1605576014801);
          msg = new FakeMessage('WTS Tada68', {
            authorID: '12345',
            channelName: 'canal',
          });
          const lastMessageAt = moment().add(-7, 'hours');
          await UserLastMessage.query().insert({ discordId: '12345', channelName: 'canal', lastMessageAt });
          initialAnnDate = lastMessageAt;
          res = await proc.handle(msg);
        });
        afterEach(() => tk.reset());

        it('keeps the message', async () => {
          expect(msg.deleted).to.be.false;
        });

        it('returns false to allow message to be sent', async () => {
          expect(res).to.eql(false);
        });

        it('tracks the last message', async () => {
          const last1 = await UserLastMessage.for('12345', 'canal');
          expect(last1.getTime()).to.eql(moment().valueOf());
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
