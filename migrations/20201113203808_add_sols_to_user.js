
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.integer('sols');
    }),
    knex.schema.raw('UPDATE users SET sols=bonus;'),
  ]);
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('sols');
  });
};
