const { expect } = require('chai');
const Setting = require('../../src/models/Setting');

describe('Setting', async () => {
  describe('set', () => {
    it('inserts a record', async () => {
      await Setting.set('ABC', 1);
      expect(await Setting.get('ABC')).to.eql('1');
    });

    it('updates a record', async () => {
      await Setting.set('ABC', 1);
      await Setting.set('ABC', 2);
      expect(await Setting.get('ABC')).to.eql('2');
    });
  })
});
