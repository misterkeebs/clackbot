
exports.up = function(knex) {
  return knex.schema.createTable('raffles', table => {
    table.increments('id').primary();
    table.string('name');
    table.timestamp('starts_at');
    table.timestamp('ends_at');
    table.timestamp('raffled_at');
    table.integer('winner_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('raffles');
};
