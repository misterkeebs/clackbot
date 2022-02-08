const moment = require('moment');
const { expect } = require('chai');
const tk = require('timekeeper');

const Cooldown = require('../../src/models/Cooldown');

describe('Cooldown', async () => {
  it('allows initial action', async () => {
    expect(await Cooldown.for('sample', 10)).to.be.true;
  });

  it('denies actions within cooldown period', async () => {
    const time = moment('2021-01-01 20:00');

    tk.freeze(time.toDate());
    expect(await Cooldown.for('sample', 10)).to.be.true;

    tk.freeze(time.add(10, 'minutes').toDate());
    expect(await Cooldown.for('sample', 10)).to.be.false;

    tk.freeze(time.add(1, 'second').toDate());
    expect(await Cooldown.for('sample', 10)).to.be.true;
    expect(await Cooldown.for('sample', 10)).to.be.false;

    tk.freeze(time.add(11, 'minutes').toDate());
    expect(await Cooldown.for('sample', 10)).to.be.true;
    expect(await Cooldown.for('sample', 10)).to.be.false;

    tk.reset();
  });
});
