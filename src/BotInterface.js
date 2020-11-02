class BotInterface {
  constructor(bot) {
    this.bot = bot;
  }

  async connect() {
    await this.handleConnection();
  }
}

module.exports = BotInterface;
