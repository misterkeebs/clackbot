const tk = require('timekeeper');
const moment = require('moment');
const { expect } = require('chai');
const { readFixture } = require('../Utils');

const GroupBuy = require('../../src/models/GroupBuy');
const GroupBuyNotifier = require('../../src/tasks/GroupBuyNotifier');
const Setting = require('../../src/models/Setting');

describe('GroupBuyNotifier', async () => {
  const gb = new GroupBuyNotifier();

  describe('formatNotice', async () => {
    describe('with additionalLinks', async () => {
      let msg, embed;

      beforeEach(async () => {
        const gbs = [
          {
            name: 'GMK Duck',
            startsAt: moment('2020-01-01'),
            endsAt: moment('2020-03-01'),
            pricing: 'Base: 150',
            additionalLinks: 'Geekhack: http://something',
          }
        ];
        const discord = {
          channels: {
            cache: [
              {
                name: 'ann',
                send: (_msg, _embed) => {
                  msg = _msg;
                  embed = _embed;
                },
              }
            ]
          }
        };
        new GroupBuyNotifier({}, discord).formatNotice('starting', '#000000', gbs);
      });

      it('sends a message showing the number of GBs', async () => {
        expect(msg).to.eql('<@&780599217051664400> there are 1 groupbuys starting today:');
      });

      it('includes the GB name', async () => {
        expect(embed.fields[0].name).to.eql('GMK Duck');
      });

      it('includes the GB base price', async () => {
        expect(embed.fields[0].value).to.include('> Base: 150\n');
      });

      it('includes the start date', async () => {
        expect(embed.fields[0].value).to.include('> Starts: jan 1\n');
      });

      it('includes the end date', async () => {
        expect(embed.fields[0].value).to.include('> Ends: mar 1\n');
      });

      it('includes the link', async () => {
        expect(embed.fields[0].value).to.include('> [Geekhack](http://something)');
      });
    });

    describe('with no additionalLinks', async () => {
      let msg, embed;

      beforeEach(async () => {
        const gbs = [
          {
            name: 'GMK Duck',
            startsAt: moment('2020-01-01'),
            endsAt: moment('2020-03-01'),
            pricing: 'Base: 150',
            additionalLinks: '',
          }
        ];
        const discord = {
          channels: {
            cache: [
              {
                name: 'ann',
                send: (_msg, _embed) => {
                  msg = _msg;
                  embed = _embed;
                },
              }
            ]
          }
        };
        new GroupBuyNotifier({}, discord).formatNotice('starting', '#000000', gbs);
      });

      it('sends a message showing the number of GBs', async () => {
        expect(msg).to.eql('<@&780599217051664400> there are 1 groupbuys starting today:');
      });

      it('includes the GB name', async () => {
        expect(embed.fields[0].name).to.eql('GMK Duck');
      });

      it('includes the GB base price', async () => {
        expect(embed.fields[0].value).to.include('> Base: 150');
      });

      it('includes the start date', async () => {
        expect(embed.fields[0].value).to.include('> Starts: jan 1\n');
      });

      it('includes the end date', async () => {
        expect(embed.fields[0].value).to.include('> Ends: mar 1\n');
      });
    });

    describe('with no endDate', async () => {
      let msg, embed;

      beforeEach(async () => {
        const gbs = [
          {
            name: 'GMK Duck',
            startsAt: moment('2020-01-01'),
            endsAt: '',
            pricing: 'Base: 150',
            additionalLinks: '',
          }
        ];
        const discord = {
          channels: {
            cache: [
              {
                name: 'ann',
                send: (_msg, _embed) => {
                  msg = _msg;
                  embed = _embed;
                },
              }
            ]
          }
        };
        new GroupBuyNotifier({}, discord).formatNotice('starting', '#000000', gbs);
      });

      it('sends a message showing the number of GBs', async () => {
        expect(msg).to.eql('<@&780599217051664400> there are 1 groupbuys starting today:');
      });

      it('includes the GB name', async () => {
        expect(embed.fields[0].name).to.eql('GMK Duck');
      });

      it('includes the GB base price', async () => {
        expect(embed.fields[0].value).to.include('> Base: 150');
      });

      it('includes the start date', async () => {
        expect(embed.fields[0].value).to.include('> Starts: jan 1\n');
      });
    });
  });

  describe('sync', async () => {
    it('creates all the entries', async () => {
      const json = () => Promise.resolve(readFixture('gb-data'));
      await gb.update(() => { return { json }; });
      expect(await GroupBuy.query().count()).to.eql([{ count: '822' }]);
    });
  });

  describe('canRun', async () => {
    describe('when it never ran before', async () => {
      beforeEach(() => tk.freeze(1624627709000)); // Fri, 25 Jun 2021 10:02:00 GMT-3 (Brazil Time)
      afterEach(() => tk.reset());

      it('can run at 10AM', async () => {
        expect(await gb.canRun(10)).to.eql(true);
      });

      it(`can run at 10PM`, async () => {
        expect(await gb.canRun(22)).to.eql(true);
      });
    });

    describe('when it ran before', async () => {
      beforeEach(() => tk.freeze(1624627709000)); // Fri, 25 Jun 2021 10:02:00 GMT-3 (Brazil Time)
      afterEach(() => tk.reset());

      describe(`when it's the same day`, async () => {
        beforeEach(async () => {
          await Setting.set('LAST_GB_NOTIFICATION', moment());
        });

        it(`can't run at 9AM`, async () => {
          tk.travel(moment().add(-1, 'hour').toDate());
          expect(await gb.canRun(9)).to.eql(false);
        });

        it(`can't run at 10AM`, async () => {
          expect(await gb.canRun(10)).to.eql(false);
        });
      });

      describe(`when it's the next day`, async () => {
        beforeEach(async () => {
          await Setting.set('LAST_GB_NOTIFICATION', moment(1624627709000).add(-20, 'hours').toString());
        });

        it(`can't run at 9AM`, async () => {
          tk.travel(moment().add(-1, 'hour').toDate());
          expect(await gb.canRun(10)).to.eql(false);
        });

        it('can run at 10AM', async () => {
          expect(await gb.canRun(10)).to.eql(true);
        });
      });
    });
  });

  describe('execute', async () => {
    beforeEach(() => tk.freeze(1605576014801));
    afterEach(() => tk.reset());

    beforeEach(async () => {
      const gb1 = await GroupBuy.query().insert({ name: 'starting', startsAt: moment() });
      const gb2 = await GroupBuy.query().insert({ name: 'ending', startsAt: moment().add(-30, 'day'), endsAt: moment() });
      console.log('gb1', gb1);
      console.log('gb2', gb2);
    });

    it('shows all GBs that start today', async () => {
      // await gb.execute();
    });

    it('shows all GBs that end today', async () => {
      // ...
      // await gb.execute();
    });
  });
});
