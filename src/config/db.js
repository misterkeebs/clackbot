const knex = require('knex');
const { knexSnakeCaseMappers } = require('objection');

const knexConfig = require('../../knexfile');

const environment = process.env.DB_ENV || 'development';

module.exports = knex({ ...knexConfig[environment], ...knexSnakeCaseMappers() });
