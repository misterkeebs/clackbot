process.env.NODE_ENV = 'test';
process.env.DB_ENV = 'test';

const knex = require('../src/config/db');

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
});
