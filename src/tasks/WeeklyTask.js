const moment = require('moment-timezone');

const ScheduledTask = require('./ScheduledTask');
const Setting = require('../models/Setting');

class WeeklyTask extends ScheduledTask {
  constructor(name, weekday, startsAt, timeZone) {
    super(name, startsAt, timeZone);
    this.weekday = weekday;
  }

  async canRun() {
    const now = moment.tz(this.timeZone);
    const weekday = WeeklyTask.ISO_WEEKDAYS[parseInt(now.format('E'), 10)];
    const lastRunStr = await Setting.get(this.settingKey);

    if (lastRunStr) {
      const lastRun = moment.tz(lastRunStr, this.timeZone);
      const diff = now.diff(lastRun, 'days');
      if (diff > 7) return super.canRun();
    }

    return weekday === this.weekday && super.canRun();
  }
}

WeeklyTask.ISO_WEEKDAYS = [
  null,
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];


module.exports = WeeklyTask;
