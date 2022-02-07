const Command = require('./Command');
const Setting = require('../models/Setting');

class Build extends Command {
  command = 'build';
  static interfaces = ['twitch'];

  async handle() {
    await this.handleSubcommand();
  }

  async handleSet() {
    console.log('this.userData', this.userData);
    console.log('this.args', this.args);
    if (!this.isTwitchMod()) {
      return await this.handleDefault();
    }
  }

  async handleDefault() {
    const build = await Setting.get('build');
    const name = process.env.TWITCH_CHANNEL;

    if (!build) {
      return await this.reply(`${name} não tem nenhuma atividade definida atualmente.`);
    }

    return await this.reply(`${name} está ${build}.`);
  }
}

module.exports = Build;
