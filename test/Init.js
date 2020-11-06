const knex = require('../src/config/db');

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
});
