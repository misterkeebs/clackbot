require('dotenv').config();
const moment = require('moment');
const Discord = require('discord.js');
const TwitchApi = require('./src/TwitchApi');
const twitch = require('./src/TwitchClient');
const discord = require('./src/DiscordClient');
const GroupBuy = require('./src/models/GroupBuy');
const GroupBuyNotifier = require('./src/tasks/GroupBuyNotifier');

function connect() {
  return new Promise((resolve, reject) => {
    discord.login(process.env.DISCORD_TOKEN);
    discord.on('ready', () => {
      resolve(discord);
    });
    discord.on('error', err => {
      console.error('Error connecting to Discord', err);
    });
  });
}

async function main() {
  client = await twitch.connect();
  discordClient = await connect();

  //   const notifier = new GroupBuyNotifier(client, discordClient);
  //   await notifier.execute();
  // }

  // function old() {

  function formatMulti(str) {
    return str.split(',').map(s => s.trim()).map(s => {
      console.log('s', s);
      const [key, ...values] = s.split(':');
      const value = values.join(':');
      if (value.includes(':')) {
        return `${key}\n> ${value.trim().replace(/:/, '\n>')}`;
      }
      return `> ${s}`;
    }).join('\n');
  }

  const [gb] = await GroupBuy.query().where('name', 'GMK Avanguardia');

  const embed = new Discord.MessageEmbed()
    .setTitle(gb.name)
    .setColor('#543e94')
    .setImage(gb.mainImage)
    .setAuthor('Informação do GB', 'https://images-ext-2.discordapp.net/external/7mJlSRNI6rDgvoVR1LSqXJvsgiGI4rHO2Msgg5b8M88/https/static-cdn.jtvnw.net/jtv_user_pictures/7ecbe0e8-904d-49c5-b87d-dcadda378864-profile_image-300x300.png')
    .addFields(
      { name: 'Starts', value: gb.startsAt },
      { name: 'Ends', value: gb.endsAt },
      { name: 'Sale Type', value: gb.saleType },
      { name: 'Pricing', value: formatMulti(gb.pricing) },
      { name: 'Vendors', value: formatMulti(gb.vendors) }
    );

  const channel = discordClient.channels.cache.find(c => c.name === 'ann');
  await channel.send(embed);

  // .setURL(`https://twitch.tv/${stream.user_login}`)
  // .setAuthor(stream.user_name, user.profile_image_url)
  // .setThumbnail(user.profile_image_url)
  // .addFields(
  //   { name: 'Starts', value: moment(gb.startsAt).format('MMM D'), inline: true },
  //   { name: 'Finishes', value: moment(gb.endsAt).format('MMM D'), inline: true },
  // )
  // .setImage(gb.mainImage);

  // const fields = [
  //   ['Starts', 'startsAt', 'date'],
  //   ['Ends', 'endsAt', 'date'],
  //   [null, 'pricing'],
  // ];

  // gbs.forEach(gb => {
  //   const body = [];
  //   fields.forEach(([label, field, format]) => {
  //     const item = (label ? `> ${label}: ` : '> ')
  //       + (format === 'date' ? moment(gb[field]).format('MMM D') : gb[field]);
  //     body.push(item);
  //   });
  //   console.log('body', body);
  //   embed.addField(gb.name, body.join('\n'), true);
  // });

  // const channel = discordClient.channels.cache.find(c => c.name === 'ann');
  // channel.send(embed);

  // const guild = discordClient.guilds.cache.find(g => g.name === process.env.DISCORD_GUILD_NAME);
  // console.log('guild', guild);
  // const { everyone } = guild.roles;
  // console.log('everyone', everyone);

  // const twitch = new TwitchApi();
  // const stream = await twitch.getCurrentStream('yayitskate');
  // console.log('stream', stream);
  // const user = (await twitch.getUser(stream.user_login)).data[0];

  // const image = stream.thumbnail_url.replace('{width}', 320).replace('{height}', 180)
  // const embed = new Discord.MessageEmbed()
  //   .setColor('#543e94')
  //   .setTitle(stream.title)
  //   .setURL(`https://twitch.tv/${stream.user_login}`)
  //   .setAuthor(stream.user_name, user.profile_image_url)
  //   .setThumbnail(user.profile_image_url)
  //   .addFields(
  //     { name: 'About', value: stream.game_name, inline: true },
  //     { name: 'Viewers', value: stream.viewer_count, inline: true },
  //   )
  //   .setImage(image);

  // const channel = discordClient.channels.cache.find(c => c.name === 'ann');
  // channel.send(`${everyone.toString()} **${user.display_name}** acabou de entrar ao vivo, vai conferir: https://twitch.tv/${user.login}`, embed);
};

main().then(x => {
  console.log('Finished with', x);
}).catch(err => {
  console.error('Error', err);
});
