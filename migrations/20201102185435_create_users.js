
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('display_name');
    table.integer('bonus');
    table.integer('last_session_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
