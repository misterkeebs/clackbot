
exports.up = function (knex) {
  return knex.schema.createTable('settings', table => {
    table.string('key').primary();
    table.string('value');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('settings');
};
