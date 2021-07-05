const Canvas = require('canvas');
Canvas.registerFont('./src/fonts/Roboto-Regular.ttf', { family: 'Roboto' });

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
    return games.find(game => game.player1 === player.id || game.player2 === player.id);
  }

  constructor(player1, player2) {
    this.player1 = player1.id;
    this.player2 = player2.id;
    this.board = new Array(3).fill(null).map(() => new Array(3).fill(null));
    this.nextPlayer = player1.id;
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

  finish() {
    const pos = games.find(g => g === this);
    games.splice(pos, 1);
  }

  isFinished() {
    return this.getWinner() !== false;
  }

  getPlayers() {
    return [this.player1, this.player2];
  }

  isNext(player) {
    return this.nextPlayer === player.id;
  }

  isPlayer1() {
    return this.nextPlayer == this.player1;
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
    if (!this.isNext(player)) {
      throw new NotPlayerTurnError();
    }

    this.board[y][x] = player.id;
    this.nextPlayer = this.nextPlayer === this.player1 ? this.player2 : this.player1;
  }

  toCanvas() {
    const canvas = Canvas.createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    const lineColor = '#ddd';

    const canvasSize = 500;
    var sectionSize = canvasSize / 3;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.translate(0.5, 0.5);

    function drawLines(lineWidth, strokeStyle) {
      const lineStart = 4;
      const lineLength = canvasSize - 5;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();

      for (let y = 1; y <= 2; y++) {
        ctx.moveTo(lineStart, y * sectionSize);
        ctx.lineTo(lineLength, y * sectionSize);
      }

      for (let x = 1; x <= 2; x++) {
        ctx.moveTo(x * sectionSize, lineStart);
        ctx.lineTo(x * sectionSize, lineLength);
      }

      ctx.stroke();
    }

    const drawLabels = () => {
      const lineStart = 4;
      const lineLength = canvasSize - 5;
      const halfSectionSize = (0.5 * sectionSize);

      ctx.font = '20px Helvetica';
      ctx.fillStyle = '#888';
      const height = ctx.measureText('M').width;

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const el = this.board[y][x];
          if (el !== null) continue;

          const text = String.fromCharCode(65 + y) + (x + 1);
          const m = ctx.measureText(text);
          const centerX = (x * sectionSize) + halfSectionSize - (m.width / 2);
          const centerY = (y * sectionSize) + halfSectionSize + (height / 2);
          ctx.fillText(text, centerX, centerY);
        }
      }
    }

    function drawO(x, y) {
      const halfSectionSize = (0.5 * sectionSize);
      const centerX = x + halfSectionSize;
      const centerY = y + halfSectionSize;
      const radius = (sectionSize - 100) / 2;
      const startAngle = 0 * Math.PI;
      const endAngle = 2 * Math.PI;

      ctx.lineWidth = 10;
      ctx.strokeStyle = '#01bbc2';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();
    }

    function drawX(x, y) {
      ctx.strokeStyle = "#f1be32";

      ctx.beginPath();

      var offset = 50;
      ctx.moveTo(x + offset, y + offset);
      ctx.lineTo(x + sectionSize - offset, y + sectionSize - offset);

      ctx.moveTo(x + offset, y + sectionSize - offset);
      ctx.lineTo(x + sectionSize - offset, y + offset);

      ctx.stroke();
    }

    function addPiece(piece, coord) {
      const y = coord.charCodeAt(0) - 65;
      const x = parseInt(coord.charAt(1), 10) - 1;

      if (piece === 'X') drawX(x * sectionSize, y * sectionSize);
      if (piece === 'O') drawO(x * sectionSize, y * sectionSize);
    }

    drawLines(10, lineColor);
    drawLabels();

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const cell = this.board[y][x] === this.player1
          ? 'X'
          : this.board[y][x] === this.player2 ? 'O' : null;
        addPiece(cell, String.fromCharCode(65 + y) + (x + 1));
      }
    }

    return canvas;
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

