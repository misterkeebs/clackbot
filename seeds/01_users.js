
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          'id': 1,
          'display_name': 'SrTeclados',
          'bonus': 164,
          'last_session_id': 2,
          'discord_id': 399970540586270700,
          'discord_wannabe': 'fcoury | mrkeebs.com#0001',
          'sols': 78,
        },
        {
          'id': 7,
          'display_name': 'MisterKeebs',
          'discord_id': 113700980444364800,
          'discord_wannabe': 'Felipe#5693',
        },
        {
          'id': 3,
          'display_name': 'killuadownn',
          'bonus': 12150,
          'discord_wannabe': 'Kamui#3863',
        },
        {
          'id': 4,
          'display_name': 'vono____',
          'bonus': 9188,
          'discord_wannabe': 'Vono#3765',
        },
        {
          'id': 2,
          'display_name': 'pedropier',
          'bonus': 890,
          'discord_wannabe': 'Pedro Piermatei#7976',
        },
        {
          'id': 5,
          'display_name': 'eruui',
          'discord_wannabe': 'Eru#8394',
        },
        {
          'id': 6,
          'display_name': 'alixekkj',
          'discord_wannabe': 'alice#7917',
        },
      ]);
    });
};
