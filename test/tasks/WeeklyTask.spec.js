const tk = require('timekeeper');
const moment = require('moment-timezone');
const { expect } = require('chai');

const Setting = require('../../src/models/Setting');
const WeeklyTask = require('../../src/tasks/WeeklyTask');

const MONDAY = moment.tz('2022-02-14 10:00', 'America/Sao_Paulo').toDate();
const TUESDAY = moment.tz('2022-02-15 10:00', 'America/Sao_Paulo').toDate();

describe('WeeklyTask', async () => {
  let task, ran;

  beforeEach(async () => {
    ran = false;
    task = new WeeklyTask('WeeklyTask', 'Monday', '10', 'America/Sao_Paulo');
    task.run = () => {
      ran = true;
    };
  });
  afterEach(() => tk.reset());

  describe('canRun', async () => {
    describe('when not yet executed', async () => {
      it('can run at 10AM on Monday', async () => {
        tk.freeze(MONDAY);
        expect(await task.canRun()).to.be.true;
      });

      it('can run at 11AM on Monday', async () => {
        tk.freeze(moment.tz('2022-02-14 11:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });

      it('cannot run at 10AM on Tuesday', async () => {
        tk.freeze(TUESDAY);
        expect(await task.canRun()).to.be.false;
      });
    });

    describe('when already executed on time', async () => {
      beforeEach(async () => {
        await Setting.set(task.settingKey, MONDAY.toISOString());
      });

      it('cannot run on Tuesday', async () => {
        tk.freeze(TUESDAY);
        const now = moment.tz(this.timeZone);
        expect(await task.canRun()).to.be.false;
      });

      it('can run on next Monday at 10AM ', async () => {
        tk.freeze(moment.tz('2022-02-21 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });

      it('can run on next Tuesday at 11AM', async () => {
        tk.freeze(moment.tz('2022-02-22 11:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });
    });

    describe('when already executed late', async () => {
      beforeEach(async () => {
        await Setting.set(task.settingKey, TUESDAY.toISOString());
      });

      it('cannot run on Tuesday', async () => {
        tk.freeze(TUESDAY);
        const now = moment.tz(this.timeZone);
        expect(await task.canRun()).to.be.false;
      });

      it('can run on next Monday at 10AM ', async () => {
        tk.freeze(moment.tz('2022-02-21 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });

      it('cannot run on next Tuesday at 10AM', async () => {
        tk.freeze(moment.tz('2022-02-22 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.false;
      });

      it('cannot run on next Thursday at 9AM', async () => {
        tk.freeze(moment.tz('2022-02-24 09:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.false;
      });

      it('can run on next Wednesday at 10AM', async () => {
        tk.freeze(moment.tz('2022-02-23 10:00', 'America/Sao_Paulo').toDate());
        expect(await task.canRun()).to.be.true;
      });
    });
  });
});
