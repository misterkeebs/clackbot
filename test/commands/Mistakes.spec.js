const moment = require('moment');
const fs = require('fs');
const nock = require('nock');
const tk = require('timekeeper');
const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const Setting = require('../../src/models/Setting');

const mistakes = require('../../src/commands/Mistakes');
const iface = new FakeInterface();

describe('Mistakes', () => {
  beforeEach(() => iface.reset());

  describe('getting mistakes', async () => {
    describe('when there are no mistakes', async () => {
      it('returns a message', async () => {
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados ainda não fez nenhuma merda.');
      });
    });

    describe('when there are mistakes', async () => {
      beforeEach(async () => {
        await Setting.set('mistakes', '12');
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes', userData: {} });
      });

      it('returns the build', async () => {
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 12 vezes mas hoje ainda está ileso.');
      });

      it('keeps the same number of mistakes', async () => {
        expect(await Setting.get('mistakes')).to.eql('12');
      });
    });

    describe('when there are mistakes, including this session', async () => {
      beforeEach(async () => {
        tk.freeze(1605576014801);
        await Setting.set('mistakes', '12');
        await Setting.set('mistakes-20201116', '3');
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes', userData: {} });
      });
      afterEach(() => tk.reset());

      it('returns the build', async () => {
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 12 vezes, sendo 3 só hoje.');
      });

      it('keeps the same number of mistakes', async () => {
        expect(await Setting.get('mistakes')).to.eql('12');
        expect(await Setting.get('mistakes-20201116')).to.eql('3');
      });
    });
  });

  describe('adding mistakes', async () => {
    describe('increases the mistakes', async () => {
      let _body;

      beforeEach(async () => {
        nock('http://localhost:5000').post('/newMistake').reply(200, (uri, body) => {
          _body = body;
        });

        await Setting.set('mistakes', '12');
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake++', userData: {} });
      });

      it('returns the new mistake count', async () => {
        expect(iface.lastMessage).to.eql('SrTeclados fez merda de novo. Ele já fez merda 13 vezes, sendo 1 só hoje.');
      });

      it('increases mistakes', async () => {
        expect(await Setting.get('mistakes')).to.eql('13');
      });

      it('sends the mistakes and session mistakes to the endpoint', async () => {
        expect(_body.mistakes).to.eql(13);
        expect(_body.sessionMistakes).to.eql(1);
      });
    });
  });

  describe('removing mistakes', async () => {
    describe('with no mistakes', async () => {
      describe('decreases the mistakes', async () => {
        beforeEach(async () => {
          await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes--', userData: {} });
        });

        it('returns the new mistake count', async () => {
          expect(iface.lastMessage).to.eql('SrTeclados não fez nenhuma merda ainda. Milagre?');
        });

        it('keeps mistakes', async () => {
          expect(await Setting.get('mistakes')).to.be.undefined;
        });
      });
    });

    describe('with mistakes', async () => {
      describe('when there are no session mistakes', async () => {
        describe('decreases the mistakes', async () => {
          beforeEach(async () => {
            await Setting.set('mistakes', '12');
            await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes--', userData: {} });
          });

          it('returns the new mistake count', async () => {
            expect(iface.lastMessage).to.eql('SrTeclados agradece muito a tentativa, mas ele não fez nenhum erro ainda hoje.');
          });

          it('keeps the mistakes', async () => {
            expect(await Setting.get('mistakes')).to.eql('12');
          });
        });
      });

      describe('when there are session mistakes', async () => {
        describe('decreases the mistakes', async () => {
          beforeEach(async () => {
            tk.freeze(1605576014801);
            await Setting.set('mistakes', '12');
            await Setting.set('mistakes-20201116', '1');
            await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes--', userData: {} });
          });
          afterEach(() => tk.reset());

          it('returns the new mistake count', async () => {
            expect(iface.lastMessage).to.eql('SrTeclados foi redimido. Ele já fez merda 11 vezes, mas nenhuma hoje.');
          });

          it('decreases mistakes', async () => {
            expect(await Setting.get('mistakes')).to.eql('11');
          });

          it('decreses session mistakes', async () => {
            await Setting.set('mistakes-20201116', '0');
          });
        });
      });
    });
  });
});
