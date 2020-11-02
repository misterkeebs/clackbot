
exports.up = function(knex) {
  return knex.schema.createTable('sessions', table => {
    table.increments('id').primary();
    table.timestamp('starts_at');
    table.timestamp('ends_at');
    table.integer('duration');
    table.integer('bonus');
    table.timestamp('processed_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
