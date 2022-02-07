const moment = require('moment');
const fs = require('fs');
const { expect } = require('chai');

const FakeInterface = require('./FakeInterface');
const Setting = require('../../src/models/Setting');

const Build = require('../../src/commands/Build');
const iface = new FakeInterface();

describe.only('Build', () => {
  beforeEach(() => iface.reset());

  describe('to get a build', async () => {
    describe('when there is no build set', async () => {
      it('returns an error message', async () => {
        await new Build({ iface, channel: 'channel', user: 'user', message: '!build', userData: {} }).run();
        expect(iface.lastMessage).to.eql('SrTeclados não tem nenhuma atividade definida atualmente.');
      });
    });

    describe('when there is a build set', async () => {
      beforeEach(async () => {
        await Setting.set('build', 'montando um teclado');
      });

      it('returns the build', async () => {
        await new Build({ iface, channel: 'channel', user: 'user', message: '!build', userData: {} }).run();
        expect(iface.lastMessage).to.eql('SrTeclados está montando um teclado.');
      });
    });
  });

});
