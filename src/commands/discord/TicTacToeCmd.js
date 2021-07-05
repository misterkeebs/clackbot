const Discord = require('discord.js');
const TicTacToe = require('./TicTacToe');

const Command = require('../Command');
const User = require('../../models/User');

const invites = [];

class TicTacToeCmd extends Command {
  interfaces = ['discord'];

  constructor(options, ticTacToeClass = TicTacToe) {
    super(options);
    this.ticTacToeClass = ticTacToeClass;
  }

  async handle() {
    this.game = this.ticTacToeClass.gameFor(this.user);
    if (this.game) {
      return await this.handleGame();
    }

    const [param] = this.args;
    if (!param) {
      await this.reply('você tem que convidar alguém. Use `!velha <@convidado>` para jogar. Para mais informações use `!ajuda velha`.');
      return;
    }

    if (param === 'aceito') {
      const invitePos = invites.findIndex(i => i[1].id === this.user.id);
      if (invitePos > -1) {
        const invite = invites[invitePos];
        invites.splice(invitePos, 1);
        this.game = this.ticTacToeClass.newGame(invite[0], invite[1]);
        await this.sendToChannel(`<@!${invite[0].discordId}> seu convite foi aceito! Começando novo jogo...`);
        return await this.handleGame();
      }
      await this.reply('você não tem convites pendentes. Para começar uma nova partida mande `!velha <@usuario>.`');
    }

    invites.push([this.user, this.receiver]);
    this.sendToReceiver(`o usuário <@!${this.user.discordId}> está te convidando para uma partida de jogo da velha. Para aceitar digite \`!velha aceito\`.`);
  }

  async handleGame() {
    const [param] = this.args;
    if (param !== 'aceito') {
      this.game.play(this.user, param);
    }

    const attachment = new Discord.MessageAttachment(this.game.toCanvas().toBuffer(), 'game.png');
    const nextPlayer = await User.query().findById(this.game.nextPlayer);
    const embed = new Discord.MessageEmbed()
      .setColor(this.game.isPlayer1() ? '#32cd32' : '#bb2b1b')
      .setTitle('Jogo da Velha')
      .setDescription(`${nextPlayer.discordWannabe} joga agora`)
      .attachFiles(attachment)
      .setImage('attachment://game.png');

    this.sendToChannel(`<@!${nextPlayer.discordId}> é sua vez, mande a coordenada desejada.`, embed);
  }
}

module.exports = TicTacToeCmd;
