require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  },
  dbtest: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  },
  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
};
