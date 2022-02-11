const moment = require('moment');
const fs = require('fs');
const nock = require('nock');
const tk = require('timekeeper');
const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const Setting = require('../../src/models/Setting');

const mistakes = require('../../src/commands/Mistakes');
const iface = new FakeInterface({ name: 'twitch' });
let _body, today;

describe('Mistakes', () => {
  beforeEach(() => {
    nock('http://localhost:5000').persist().post('/newMistake').reply(200, (uri, body) => {
      _body = body;
    });

    tk.freeze(1605576014801);
    today = `mistakes-${moment().format('YYYYMMDD')}`;
    iface.reset();
  });
  afterEach(() => tk.reset());

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
        await Setting.set(today, '0');
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
        await Setting.set('mistakes', '12');
        await Setting.set(today, '3');
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes', userData: {} });
      });

      it('returns the build', async () => {
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 12 vezes, sendo 3 só hoje.');
      });

      it('keeps the same number of mistakes', async () => {
        expect(await Setting.get('mistakes')).to.eql('12');
        expect(await Setting.get(today)).to.eql('3');
      });
    });

    describe('cooldown', async () => {
      it('allows getting mistakes within cooldown period', async () => {
        const time = moment('2021-01-01 20:00');
        await Setting.set('mistakes', '2');
        await Setting.set('mistakes-20210101', '2');

        tk.freeze(time.toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 2 vezes, sendo 2 só hoje.');

        tk.freeze(time.add(30, 'seconds').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 2 vezes, sendo 2 só hoje.');

        tk.freeze(time.add(1, 'minute').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados já fez merda 2 vezes, sendo 2 só hoje.');

        tk.reset();
      });
    });
  });

  describe('adding mistakes outside of twitch', async () => {
    const iface = new FakeInterface({ name: 'discord' });

    beforeEach(async () => {
      await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake++', userData: {} });
    });

    it('returns error', async () => {
      expect(iface.lastMessage).to.eql('esse comando só pode ser usado durante lives, para saber quantas merdas o SrTeclados fez, use `!mistakes`');
    });
  });

  describe('adding mistakes', async () => {
    beforeEach(async () => {
      await Setting.set('mistakes', '12');
      await Setting.set('cooldown-mistakes', null);
      await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake++', userData: {} });
    });

    it('returns the new mistake count', async () => {
      expect(iface.lastMessage).to.eql('SrTeclados fez merda de novo. Ele já fez merda 13 vezes, sendo 1 só hoje.');
    });

    it('increases mistakes', async () => {
      expect(await Setting.get('mistakes')).to.eql('13');
    });

    it('sends the mistakes and session mistakes to the endpoint', () => {
      // protects against multiple text executions
      if (_body) {
        expect(_body.mistakes).to.eql(13);
        expect(_body.sessionMistakes).to.eql(1);
      }
    });

    describe('cooldown', async () => {
      it('prevents adding multiple mistakes in less than a minute', async () => {
        const time = moment();

        expect(iface.lastMessage).to.eql('SrTeclados fez merda de novo. Ele já fez merda 13 vezes, sendo 1 só hoje.');

        tk.freeze(time.add(30, 'seconds').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake++', userData: {} });
        expect(iface.lastMessage).to.eql('esse comando só pode ser utilizado uma vez por minuto.');

        tk.freeze(time.add(1, 'minute').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake++', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados fez merda de novo. Ele já fez merda 14 vezes, sendo 2 só hoje.');
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
            expect(iface.lastMessage).to.eql('SrTeclados agradece muito o interesse, mas ele não fez nenhuma merda ainda hoje.');
          });

          it('keeps the mistakes', async () => {
            expect(await Setting.get('mistakes')).to.eql('12');
          });
        });
      });

      describe('when there are session mistakes', async () => {
        describe('decreases the mistakes', async () => {
          beforeEach(async () => {
            await Setting.set('mistakes', '12');
            await Setting.set(today, '1');
            await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes--', userData: {} });
          });

          it('returns the new mistake count', async () => {
            expect(iface.lastMessage).to.eql('SrTeclados foi redimido. Ele já fez merda 11 vezes, mas nenhuma hoje.');
          });

          it('decreases mistakes', async () => {
            expect(await Setting.get('mistakes')).to.eql('11');
          });

          it('decreses session mistakes', async () => {
            await Setting.set(today, '0');
          });
        });
      });
    });

    describe('cooldown', async () => {
      it('prevents removing multiple mistakes in less than a minute', async () => {
        const time = moment();
        await Setting.set('mistakes', '2');
        await Setting.set(today, '2');

        tk.freeze(time.toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistakes--', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados foi redimido. Ele já fez merda 1 vezes, sendo 1 só hoje.');

        tk.freeze(time.add(30, 'seconds').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake--', userData: {} });
        expect(iface.lastMessage).to.eql('esse comando só pode ser utilizado uma vez por minuto.');

        tk.freeze(time.add(1, 'minute').toDate());
        await mistakes(iface, { channel: 'channel', user: 'user', message: '!mistake--', userData: {} });
        expect(iface.lastMessage).to.eql('SrTeclados foi redimido.');

        tk.reset();
      });
    });
  });
});
