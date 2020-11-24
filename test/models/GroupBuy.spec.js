const moment = require('moment');
const { expect } = require('chai');
const tk = require('timekeeper');

const GroupBuy = require('../../src/models/GroupBuy');

describe('GroupBuy', async () => {
  beforeEach(() => tk.freeze(1605576014801));
  afterEach(() => tk.reset());

  describe('.pending', async () => {
    let gb1, gb2, gb3, gb4;
    let ending;

    beforeEach(async () => {
      gb1 = await GroupBuy.query().insertAndFetch({ name: 'GMK One', endsAt: moment().endOf('day') });
      gb2 = await GroupBuy.query().insertAndFetch({ name: 'GMK Two', endsAt: moment().add(1, 'day') });
      gb3 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', endsAt: moment().add(-1, 'day') });
      gb4 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', endsAt: moment(), endNotifiedAt: moment() });
      ending = (await GroupBuy.ending()).map(g => g.id);
    });

    it('includes groupbuys that finish today', async () => {
      expect(ending).to.include(gb1.id);
    });

    it('excludes groupbuys that finish tomorrow', async () => {
      expect(ending).to.not.include(gb2.id);
    });

    it('excludes groupbuys that already finished', async () => {
      expect(ending).to.not.include(gb3.id);
    });

    it('excludes groupbuys that were already notified', async () => {
      expect(ending).to.not.include(gb4.id);
    });
  });

  describe('.pending', async () => {
    let gb1, gb2, gb3, gb4, gb5;
    let pending;

    beforeEach(async () => {
      gb1 = await GroupBuy.query().insertAndFetch({ name: 'GMK One', startsAt: moment().add(-1, 'second') });
      gb2 = await GroupBuy.query().insertAndFetch({ name: 'GMK Two', startsAt: moment().add(-1, 'second'), notifiedAt: moment() });
      gb3 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', startsAt: moment().add(-10, 'second'), endsAt: moment().add(-1, 'second') });
      gb4 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', startsAt: moment().add(1, 'hour') });
      gb5 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', startsAt: moment().add(1, 'hour').add(1, 'second') });
      pending = (await GroupBuy.pending()).map(g => g.id);
    });

    it('includes groupbuys that the start date is before the current date', async () => {
      expect(pending).to.include(gb1.id);
    });

    it('excludes groupbuys that the start date is before the current date but have been notified', async () => {
      expect(pending).to.not.include(gb2.id);
    });

    it('excludes groupbuys that ended', async () => {
      expect(pending).to.not.include(gb3.id);
    });

    it('includes GBs that start in one hour', async () => {
      expect(pending).to.include(gb4.id);
    });

    it('includes GBs that start in more than one hour', async () => {
      expect(pending).to.not.include(gb5.id);
    });
  });

  describe('#notified', async () => {
    let gb;

    beforeEach(async () => {
      const obj = await GroupBuy.query().insertAndFetch({ name: 'GMK One', startsAt: moment().add(-1, 'second') });
      gb = await obj.markNotified();
    });

    it('marks the gb as notified', async () => {
      expect(gb.notifiedAt).to.eql(new Date());
    });
  });
});
