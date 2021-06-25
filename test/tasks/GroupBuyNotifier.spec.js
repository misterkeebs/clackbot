const tk = require('timekeeper');
const moment = require('moment');
const { expect } = require('chai');
const { readFixture } = require('../Utils');

const GroupBuy = require('../../src/models/GroupBuy');
const GroupBuyNotifier = require('../../src/tasks/GroupBuyNotifier');
const Setting = require('../../src/models/Setting');

describe('GroupBuyNotifier', async () => {
  const gb = new GroupBuyNotifier();

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
      // ...
      // await gb.execute();
    });

    it('shows all GBs that end today', async () => {
      // ...
      // await gb.execute();
    });
  });
});
