const InvalidMoveError = require('./InvalidMoveError');
const NotPlayerTurnError = require('./NotPlayerTurnError');

const games = [];

class TicTacToe {
  static newGame(player1, player2) {
    const game = new TicTacToe(player1, player2);
    games.push(game);
    return game;
  }

  static getGames() {
    return games;
  }

  static resetGames() {
    games.length = 0;
  }

  static gameFor(player) {
    return games.find(game => game.player1 === player || game.player2 === player);
  }

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Array(3).fill(null).map(() => new Array(3).fill(null));
    this.nextPlayer = player1;
  }

  setBoard(board) {
    board.forEach((row, y) => {
      this.board[y] = row
        .split('')
        .map(cell => cell === 'X'
          ? this.player1
          : cell === 'O' ? this.player2 : null);
    });
  }

  isFinished() {
    return this.getWinner() !== false;
  }

  getPlayers() {
    return [this.player1, this.player2];
  }

  getWinner() {
    for (let i = 0; i < this.getPlayers().length; i++) {
      const player = this.getPlayers()[i];
      for (let y = 0; y < 3; y++) {
        if (this.board[y].every(c => c === player)) return player;
      }
      for (let x = 0; x < 3; x++) {
        const line = this.board.map(row => row[x]);
        if (line.every(c => c === player)) return player;
      }

      // top-bottom diagonals
      if (this.board[0][0] === player
        && this.board[1][1] === player
        && this.board[2][2] === player) return player;

      // bottom-top diagonals
      if (this.board[0][2] === player
        && this.board[1][1] === player
        && this.board[2][0] === player) return player;
    }

    // tied game
    if (this.board.every(row => row.every(cell => cell !== null))) return null;

    return false;
  }

  posToCoord(posString) {
    const y = posString.charCodeAt(0) - 65;
    const x = parseInt(posString.slice(1), 10) - 1;
    return { x, y };
  };

  play(player, posString) {
    const { x, y } = this.posToCoord(posString);
    const line = this.board[y];
    const cell = line[x];

    if (this.board[y][x]) {
      throw new InvalidMoveError();
    }
    if (player !== this.nextPlayer) {
      throw new NotPlayerTurnError();
    }

    this.board[y][x] = player;
    this.nextPlayer = this.nextPlayer === this.player1 ? this.player2 : this.player1;
  }
}

module.exports = TicTacToe;

// @usuario:   !velha @convidado
// bot:        @convidado o usuário @usuario te convidou para jogar velha, prá aceitar digite !velha aceitar
// @convidado: !velha aceitar
// bot:        <velha>
//             @usuario qual sua jogada? use: !velha <posicao>
// @usuario:   !velha A1
// bot:        <velha>
//             @convidado qual sua jogada? use: !velha <posicao>
// @convidado: !velha B1
// bot:        <velha>
//             @usuario qual sua jogada? use: !velha <posicao>
// @usuario:   !velha A2
// bot:        <velha>
//             @convidado qual sua jogada? use: !velha <posicao>

