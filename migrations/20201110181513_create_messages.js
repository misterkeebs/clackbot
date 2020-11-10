
exports.up = function(knex) {
  return knex.schema.createTable('messages', table => {
    table.increments('id').primary();
    table.string('key');
    table.string('value');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
