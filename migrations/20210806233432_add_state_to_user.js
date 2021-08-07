
exports.up = function (knex) {
  return knex.schema.table('users', table => {
    table.json('state').nullable;
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('state');
  });
};
