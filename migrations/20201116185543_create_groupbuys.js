
exports.up = function(knex) {
  return knex.schema.createTable('groupbuys', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('url');
    table.timestamp('starts_at');
    table.timestamp('ends_at');
    table.timestamp('created_at');
    table.timestamp('updated_at');
    table.string('created_by');
    table.string('updated_by');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('groupbuys');
};
