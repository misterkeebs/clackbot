
exports.up = function(knex) {
  return knex.schema.createTable('raffle_players', table => {
    table.increments('id').primary();
    table.integer('raffle_id');
    table.string('name');
    table.timestamp('joined_at');
    table.integer('tickets');
    table.boolean('winner');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('raffle_players');
};
