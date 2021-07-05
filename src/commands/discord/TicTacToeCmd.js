const Discord = require('discord.js');
const TicTacToe = require('./TicTacToe');

const Command = require('../Command');
const User = require('../../models/User');
const NotPlayerTurnError = require('./NotPlayerTurnError');
const InvalidMoveError = require('./InvalidMoveError');
const UnavailableCellError = require('./UnavailableCelError');

const invites = [];

class TicTacToeCmd extends Command {
  interfaces = ['discord'];

  constructor(options, ticTacToeClass = TicTacToe) {
    super(options);
    this.ticTacToeClass = ticTacToeClass;
  }

  async sendInvalid() {
    await this.reply('você tem que convidar alguém. Use `!velha <@convidado>` para jogar. Para mais informações use `!ajuda velha`.');
  }

  async handle() {
    this.game = this.ticTacToeClass.gameFor(this.user);
    if (this.game) {
      return await this.handleGame();
    }

    const [param] = this.args;
    if (!param) {
      await this.sendInvalid();
      return;
    }

    if (param.toLowerCase() === 'aceito') {
      if (this.user) {
        const invitePos = invites.findIndex(i => i[1].id === this.user.id);
        if (invitePos > -1) {
          const invite = invites[invitePos];
          invites.splice(invitePos, 1);
          this.game = this.ticTacToeClass.newGame(invite[0], invite[1]);
          await this.sendToChannel(`<@!${invite[0].discordId}> seu convite foi aceito! Começando novo jogo...`);
          return await this.handleGame();
        }
      }
      return await this.reply('você não tem convites pendentes. Para começar uma nova partida mande `!velha <@usuario>.`');
    }

    if (!this.receiver) return await this.sendInvalid();

    invites.push([this.user, this.receiver]);
    this.sendToReceiver(`o usuário <@!${this.user.discordId}> está te convidando para uma partida de jogo da velha. Para aceitar digite \`!velha aceito\`.`);
  }

  async handleGame() {
    const [param] = this.args;
    if (param !== 'aceito') {
      try {
        this.game.play(this.user, param);
      } catch (e) {
        if (e instanceof NotPlayerTurnError) {
          await this.reply(`não é a sua vez de jogar.`);
          return;
        }
        if (e instanceof InvalidMoveError) {
          await this.reply(`a jogada ${param} não é válida, use uma letra (A, B ou C) e um número (1, 2 ou 3) - ex. \`!velha A3\``);
          return;
        }
        if (e instanceof UnavailableCellError) {
          await this.reply(`a posição ${param} já está ocupada, tente outra vez.`);
          return;
        }

        throw e;
      }
    }

    const attachment = new Discord.MessageAttachment(this.game.toCanvas().toBuffer(), 'game.png');
    const nextPlayer = await User.query().findById(this.game.nextPlayer);
    const embed = new Discord.MessageEmbed()
      .setColor(this.game.isPlayer1() ? '#32cd32' : '#bb2b1b')
      .setTitle('Jogo da Velha')
      .setDescription(`${nextPlayer.discordWannabe} joga agora`)
      .attachFiles(attachment)
      .setImage('attachment://game.png');

    if (this.game.isFinished()) {
      const player1 = await User.query().findById(this.game.player1);
      const player2 = await User.query().findById(this.game.player2);

      if (this.game.getWinner() === this.game.player1) {
        await this.sendToChannel(`<@!${player2.discordId}> o jogador <@!${player1.discordId}> ganhou!`, embed);
      } else if (this.game.getWinner() === this.game.player2) {
        await this.sendToChannel(`<@!${player1.discordId}> o jogador <@!${player2.discordId}> ganhou!`, embed);
      } else {
        await this.sendToChannel(`<@!${player1.discordId}> <@!${player2.discordId}> houve um empate!`, embed);
      }

      this.game.finish();
      return;
    }

    this.sendToChannel(`<@!${nextPlayer.discordId}> é sua vez, mande a coordenada desejada.`, embed);
  }
}

module.exports = TicTacToeCmd;
