
exports.up = function (knex) {
  return knex.schema.createTable('users_last_messages', table => {
    table.increments('id').primary();
    table.string('discord_id');
    table.string('channel_name');
    table.timestamp('last_message_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users_last_messages');
};
