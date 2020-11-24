
exports.up = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.timestamp('warned_at');
    table.timestamp('notified_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.dropColumn('warned_at');
    table.dropColumn('notified_at');
  });
};
