
exports.up = async function (knex) {
  await knex.schema.table('groupbuys', table => {
    table.string('type');
    table.boolean('only_display_month');
    table.string('pricing');
    table.string('sale_type');
    table.text('vendors');
    table.text('additional_links');
    table.text('main_image');
    table.text('additional_images');
    table.text('additional_description');
    table.string('discord_message');
    table.string('reddit_message');
    table.string('site_message');
  });
};

exports.down = async function (knex) {
  await knex.schema.table('groupbuys', table => {
    table.dropColumn('type');
    table.dropColumn('only_display_month');
    table.dropColumn('pricing');
    table.dropColumn('sale_type');
    table.dropColumn('vendors');
    table.dropColumn('additional_links');
    table.dropColumn('main_image');
    table.dropColumn('additional_images');
    table.dropColumn('additional_description');
    table.dropColumn('discord_message');
    table.dropColumn('reddit_message');
    table.dropColumn('site_message');
  });
};
