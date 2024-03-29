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

    it('insert multiple records', async () => {
      await Setting.set('mistakes', 13);
      await Setting.set('mistakes-20220207', 2);
      expect(await Setting.get('mistakes')).to.eql('13');
      expect(await Setting.get('mistakes-20220207')).to.eql('2');
    });
  });

  describe('get', async () => {
    it('returns undefined when not found', async () => {
      expect(await Setting.get('something')).to.be.undefined;
    });

    it('returns default value when not found', async () => {
      expect(await Setting.get('something', 10)).to.eql(10);
    });

    it('returns the value when one is found', async () => {
      await Setting.set('other', 1);
      expect(await Setting.get('other')).to.eql('1');
    });
  });

  describe('hasKey', async () => {
    it('returns false when the key does not exist', async () => {
      expect(await Setting.hasKey('here')).to.be.false;
    });

    it('returns true when the key exists', async () => {
      await Setting.set('here', 'there');
      expect(await Setting.hasKey('here')).to.be.true;
    });
  });

  describe('remove', async () => {
    it('removes the key', async () => {
      await Setting.set('some', 1);
      expect(await Setting.get('some')).to.eql('1');
      expect(await Setting.hasKey('some')).to.be.true;
      await Setting.remove('some');
      expect(await Setting.get('some')).to.be.undefined;
      expect(await Setting.hasKey('some')).to.be.false;
    });
  });
});
