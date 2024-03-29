const moment = require('moment');
const tk = require('timekeeper');
const { expect } = require('chai');
const { readFixture } = require('../Utils');

const GroupBuy = require('../../src/models/GroupBuy');

describe('GroupBuy', async () => {
  beforeEach(() => tk.freeze(1605576014801));
  afterEach(() => tk.reset());

  describe('.starting', async () => {
    let gb1, gb2, gb3;
    let starting;

    beforeEach(async () => {
      gb1 = await GroupBuy.query().insertAndFetch({ name: 'GMK One', startsAt: moment().endOf('day') });
      gb2 = await GroupBuy.query().insertAndFetch({ name: 'GMK Two', startsAt: moment().add(1, 'day') });
      gb3 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', startsAt: moment().add(-1, 'day') });
      starting = (await GroupBuy.starting()).map(g => g.id);
    });

    it('includes groupbuys that start today', async () => {
      expect(starting).to.include(gb1.id);
    });

    it('excludes groupbuys that start tomorrow', async () => {
      expect(starting).to.not.include(gb2.id);
    });

    it('excludes groupbuys that already started', async () => {
      expect(starting).to.not.include(gb3.id);
    });
  });

  describe('.ending', async () => {
    let gb1, gb2, gb3, gb4;
    let ending;

    beforeEach(async () => {
      gb1 = await GroupBuy.query().insertAndFetch({ name: 'GMK One', endsAt: moment().endOf('day') });
      gb2 = await GroupBuy.query().insertAndFetch({ name: 'GMK Two', endsAt: moment().add(1, 'day') });
      gb3 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', endsAt: moment().add(-1, 'day') });
      gb4 = await GroupBuy.query().insertAndFetch({ name: 'GMK Three', endsAt: moment(), endNotifiedAt: moment() });
      ending = (await GroupBuy.ending()).map(g => g.id);
    });

    it('includes groupbuys that finish tomorrow', async () => {
      expect(ending).to.include(gb2.id);
    });

    it('excludes groupbuys that finish today', async () => {
      expect(ending).to.not.include(gb1.id);
    });

    it('excludes groupbuys that already finished', async () => {
      expect(ending).to.not.include(gb3.id);
    });

    xit('excludes groupbuys that were already notified', async () => {
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

  describe('#hasStarted', async () => {
    let gb1, gb2, gb3;

    beforeEach(async () => {
      gb1 = await GroupBuy.query().insertAndFetch({ name: 'Started', startsAt: moment().add(-1, 'hour') });
      gb2 = await GroupBuy.query().insertAndFetch({ name: 'Not started', startsAt: moment().add(1, 'hour') });
      gb3 = await GroupBuy.query().insertAndFetch({ name: 'No time to start' });
    });

    it('is true when start time is in the past', async () => {
      expect(gb1.hasStarted()).to.be.true;
    });

    it('is false when start time is in the future', async () => {
      expect(gb2.hasStarted()).to.be.false;
    });

    it('is false when start time is null', async () => {
      expect(gb3.hasStarted()).to.be.false;
    });
  });

  describe('fromData', async () => {
    let buy;

    it('parses a GB entry', async () => {
      const json = readFixture('gb-data').pop();
      const buy = await GroupBuy.fromData(json);
      expect(buy.type).to.eql('switches');
    });
  });
});
