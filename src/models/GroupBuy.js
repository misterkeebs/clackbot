const moment = require('moment');
const { raw } = require('objection');

const Model = require('./Model');

class GroupBuy extends Model {
  static get tableName() {
    return 'groupbuys';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        url: { type: 'string' },
        startsAt: { type: 'datetime' },
        endsAt: { type: 'datetime' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
        createdBy: { type: 'string' },
        updatedBy: { type: 'string' },
        warnedAt: { type: 'datetime' },
        notifiedAt: { type: 'datetime' },
        endWarnedAt: { type: 'datetime' },
        endNotifiedAt: { type: 'datetime' },
      },
    };
  }

  static pending() {
    return this.query()
      .where('startsAt', '<=', moment().add(1, 'hour'))
      .where(function() {
        this
          .whereNull('endsAt')
          .orWhere('endsAt', '>=', moment());
      })
      .whereNull('notifiedAt');
  }

  static ending() {
    return this.query()
      .where(raw('DATE(ends_at)'), raw(`DATE('${moment().format('YYYY-MM-DD')}')`))
      .whereNull('endNotifiedAt');
  }

  hasStarted() {
    return moment(this.startsAt).isBefore(moment());
  }

  markNotified() {
    return this.$query().patchAndFetch({ notifiedAt: new Date() });
  }

  markWarned() {
    return this.$query().patchAndFetch({ warnedAt: new Date() });
  }

  markEndNotified() {
    return this.$query().patchAndFetch({ endNotifiedAt: new Date() });
  }

  markEndWarned() {
    return this.$query().patchAndFetch({ endWarnedAt: new Date() });
  }
}

module.exports = GroupBuy;
