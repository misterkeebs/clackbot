
exports.up = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.timestamp('end_warned_at');
    table.timestamp('end_notified_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.dropColumn('end_warned_at');
    table.dropColumn('end_notified_at');
  });
};
