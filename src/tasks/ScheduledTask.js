const moment = require('moment-timezone');

const Setting = require('../models/Setting');

class ScheduledTask {
  async canRun() {
    const now = moment.tz(this.timeZone);
    const wantedTime = moment(now)
      .set('hour', this.startsAt)
      .set('minute', 0)
      .set('second', 0);
    const lastRunStr = await Setting.get(this.settingKey);
    let diff = undefined;

    if (lastRunStr) {
      const lastRun = moment.tz(lastRunStr, this.timeZone);

      diff = wantedTime.diff(lastRun, 'days');
      if (diff < 1) return false;
    }

    return !lastRunStr || diff > 1 || parseInt(now.format('H'), 10) >= parseInt(this.startsAt, 10);
  }

  async start() {
    await this.run();
    await Setting.set(this.settingKey, moment.tz(this.timeZone).toISOString());
  }

  get settingKey() {
    return `${this.name}_LAST_RUN`;
  }
}

module.exports = ScheduledTask;
