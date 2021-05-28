const Discord = require('discord.js');
const Canvas = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji');

const User = require('../../models/User');

const Top = async (iface, { channel, user: userName, message, rawMessage = {} }) => {
  const leaders = await User.leaders();

  await drawLeaderboard(leaders);
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'leaderboard.png');
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('MrKeebs')
    .setDescription('Ranking Geral de Clacks')
    .attachFiles(attachment)
    .setImage('attachment://leaderboard.png');
  rawMessage.channel.send(embed);
};
Top.interfaces = ['discord'];

Canvas.registerFont('./src/fonts/Roboto-Regular.ttf', { family: 'Roboto' });

const canvas = Canvas.createCanvas(500, 460);
const ix = 10;
const iy = 10;
const fx = canvas.width;
const h = canvas.height;

function fittingString(c, str, maxWidth) {
  var width = c.measureText(str).width;
  var ellipsis = '…';
  var ellipsisWidth = c.measureText(ellipsis).width;
  if (width <= maxWidth || width <= ellipsisWidth) {
    return str;
  } else {
    var len = str.length;
    while (width >= maxWidth - ellipsisWidth && len-- > 0) {
      str = str.substring(0, len);
      width = c.measureText(str).width;
    }
    return str + ellipsis;
  }
}

function roundedRect(ctx, options) {
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineJoin = "round";
  ctx.lineWidth = options.radius;

  ctx.strokeRect(
    options.x + (options.radius * .5),
    options.y + (options.radius * .5),
    options.width - options.radius,
    options.height - options.radius
  );

  ctx.fillRect(
    options.x + (options.radius * .5),
    options.y + (options.radius * .5),
    options.width - options.radius,
    options.height - options.radius
  );

  ctx.stroke();
  ctx.fill();
}

async function drawLeaderboard(leaders) {
  const ctx = canvas.getContext('2d');

  const sh = 40;
  for (let i = 0; i < leaders.length; i++) {
    const { discordWannabe, bonus, sols } = leaders[i];
    const sy = iy + i * (sh + (i > 0 ? 5 : 0));

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgb(64, 67, 72)';
    roundedRect(ctx, {
      x: ix,
      y: sy,
      width: fx - 20,
      height: sh,
      radius: 7,
      color: 'rgb(64, 67, 72)',
    });
    //   ctx.fillRect(ix, sy, fx-20, sh);

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = "18px 'Roboto'";

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(`#${i + 1}`, 15, sy + 27);
    ctx.fillText(fittingString(ctx, discordWannabe, 200), 50, sy + 27);

    await fillTextWithTwemoji(ctx, `🪙 ${bonus}`, fx - 180, sy + 27);
    if (sols) await fillTextWithTwemoji(ctx, `🌞 ${sols}`, fx - 100, sy + 27);
  }
}

module.exports = Top;
