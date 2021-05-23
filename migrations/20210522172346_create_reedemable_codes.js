
exports.up = function(knex) {
  return knex.schema.createTable('redeemable_codes', table => {
    table.increments('id').primary();
    table.string('code');
    table.timestamp('created_at');
    table.timestamp('redeemed_at');
    table.integer('redeemed_by');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('redeemable_codes');
};
