const tk = require('timekeeper');
const moment = require('moment-timezone');
const { expect } = require('chai');

const Setting = require('../../src/models/Setting');
const ScheduledTask = require('../../src/tasks/ScheduledTask');

describe('ScheduledTask', async () => {
  let task, ran;

  beforeEach(async () => {
    ran = false;
    task = new ScheduledTask();
    task.name = 'DailyTask';
    task.timeZone = 'America/Sao_Paulo';
    task.startsAt = '10';
    task.run = () => {
      ran = true;
    };
  });
  afterEach(() => tk.reset());

  describe('canRun', async () => {
    describe('when not yet executed', async () => {
      it('can run at 10AM', async () => {
        tk.freeze(moment.tz('2021-02-14 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });

      it('can run at 11AM', async () => {
        tk.freeze(moment.tz('2021-02-14 11:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });
    });

    describe('when already executed', async () => {
      beforeEach(async () => {
        await Setting.set(task.settingKey, moment.tz('2021-02-14 10:00', 'America/Sao_Paulo').toISOString());
      });

      it('cannot run at 10AM of the same day', async () => {
        tk.freeze(moment.tz('2021-02-14 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.false;
      });

      it('can run at 10AM of the next day', async () => {
        tk.freeze(moment.tz('2021-02-15 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });

      it('can run at 11AM of the next day', async () => {
        tk.freeze(moment.tz('2021-02-15 11:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });
    });
  });

  describe('start', async () => {
    beforeEach(async () => {
      tk.freeze(moment.tz('2021-02-15 10:00', 'America/Sao_Paulo').toDate());
      await task.start();
    });

    it('calls the run method', async () => {
      expect(ran).to.be.true;
    });

    it('marks last execution', async () => {
      expect(await Setting.get(task.settingKey)).to.eql('2021-02-15T13:00:00.000Z');
    });

    it('makes canRun evaluate to false', async () => {
      expect(await task.canRun()).to.be.false;
    });
  });
});
