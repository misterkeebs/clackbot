class Action {
  constructor(user, state = 0, data = {}) {
    this.user = user;
    this.currentState = state;
    this.data = data;
  }

  async save() {
    await this.user.saveState(this.name, this.currentState, this.data);
  }

  async reply(text) {
    if (this.msg.guild) {
      return this.msg.author.send(text);
    }
    return this.msg.reply(text);
  }

  async run(msg) {
    this.msg = msg;
    this.content = this.msg.content;
    const handled = await this.handle();
    if (handled) {
      this.currentState++;
      await this.save();
    }
  }
}

module.exports = Action;
