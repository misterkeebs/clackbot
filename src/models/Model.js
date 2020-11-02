const { Model } = require('objection');
const knex = require('../config/db');

Model.knex(knex);

class BaseModel extends Model {
}

module.exports = BaseModel;
