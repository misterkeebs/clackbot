class ImageOnly {
  constructor(channels) {
    this.channels = (channels || process.env.IMAGE_ONLY_CHANNELS).split(',');
  }

  async handle(msg) {
    if (!msg.channel || !this.channels.includes(msg.channel.name)) return false;

    const { attachments } = msg;

    if (attachments.size < 1) {
      await msg.author.send(`Sua mensagem no canal #${msg.channel.name} foi excluída porque este canal permite apenas imagens.`);
      await msg.delete();
      return true;
    }

    return false;
  }
}

module.exports = ImageOnly;

