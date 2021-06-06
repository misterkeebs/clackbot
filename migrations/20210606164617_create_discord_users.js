
exports.up = function (knex) {
  return knex.schema.createTable('discord_users', table => {
    table.increments('id').primary();
    table.string('discord_id');
    table.timestamp('last_announce_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('discord_users');
};
