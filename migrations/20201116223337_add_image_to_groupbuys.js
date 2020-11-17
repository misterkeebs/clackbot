
exports.up = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.string('image');
  });
};

exports.down = function(knex) {
  return knex.schema.table('groupbuys', table => {
    table.dropColumn('image');
  });
};
