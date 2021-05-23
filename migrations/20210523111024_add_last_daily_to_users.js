
exports.up = function (knex) {
  return knex.schema.table('users', table => {
    table.timestamp('last_daily_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('last_daily_at');
  });
};
