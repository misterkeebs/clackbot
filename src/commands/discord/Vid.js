const yts = require('yt-search');
const _ = require('lodash');

async function findVid(t) {
  const terms = t.toLowerCase();
  let r = await yts.search(`MrKeebs ${terms}`);
  const mrKeebsVid = r.videos.find(v => v.author && v.author.name === 'MrKeebs');

  if (mrKeebsVid && mrKeebsVid.title.toLowerCase().includes(terms)) {
    return mrKeebsVid;
  }

  r = await yts.search(`SrTeclados ${terms}`);
  const srTecladosVid = r.videos.find(v => v.author && v.author.name === 'SrTeclados');

  if (srTecladosVid && srTecladosVid.title.toLowerCase().includes(terms)) {
    return srTecladosVid;
  }
}

const Vids = async (iface, { channel, user: userName, message }) => {
  const terms = message.split(' ').slice(1).join(' ');
  const video = await findVid(terms);

  if (!video) {
    return await iface.reply(channel, userName, `nenhum vídeo com ${terms} encontrado`);
  }

  return await iface.reply(channel, userName, `${video.title} - ${video.url}`);
};
Vids.interfaces = ['discord'];

module.exports = Vids;
