const moment = require('moment');
const _ = require('lodash');
const { raw } = require('objection');

const Model = require('./Model');

class GroupBuy extends Model {
  static get tableName() {
    return 'groupbuys';
  }

  static async sync() {
    const res = await fetch(`https://www.mechgroupbuys.com/gb-data`);
    const json = await res.json();
    const data = json.map(entry => Buy.fromJson(entry));
  }

  static async fromData(json) {
    function parseDate(date) {
      if (_.isEmpty(date)) return null;
      const res = moment(date, 'MM-DD-YY');
      if (!res.isValid()) return null;
      return res;
    }

    try {
      return await this.query().insertAndFetch({
        type: json.type,
        name: json.name,
        startsAt: parseDate(json.startDate),
        endsAt: parseDate(json.endDate),
        onlyDisplayMonth: json.onlyDisplayMonth === 'TRUE',
        pricing: json.pricing,
        saleType: json.saleType,
        vendors: json.vendors,
        additionalLinks: json.additionalLinks,
        mainImage: json.mainImage,
        additionalImages: json.additionalImages,
        additionalDescription: json.additionalDescription,
        discordMessage: json.discordMessage,
        redditMessage: json.redditMessage,
        siteMessage: json.siteMessage,
      });
    } catch (err) {
      console.error('Error with data', json, err);
      throw err;
    }
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
      .where(function () {
        this
          .whereNull('endsAt')
          .orWhere('endsAt', '>=', moment());
      })
      .whereNull('notifiedAt');
  }

  static ending() {
    return this.query()
      .where(raw('DATE(ends_at)'), raw(`DATE('${moment().add(1, 'day').format('YYYY-MM-DD')}')`));
  }

  static starting() {
    return this.query()
      .where(raw('DATE(starts_at)'), raw(`DATE('${moment().format('YYYY-MM-DD')}')`));
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
