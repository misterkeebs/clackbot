
exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.string('discord_id');
    table.string('twitch_wannabe');
    table.string('discord_wannabe');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('discord_id');
    table.dropColumn('twitch_wannabe');
    table.dropColumn('discord_wannabe');
  });
};
