const chai = require('chai');
const { expect } = chai;
const { chaiImage } = require('chai-image');
chai.use(chaiImage);

const InvalidMoveError = require('../../../src/commands/discord/InvalidMoveError');
const NotPlayerTurnError = require('../../../src/commands/discord/NotPlayerTurnError');

const TicTacToe = require('../../../src/commands/discord/TicTacToe');
const UnavailableCellError = require('../../../src/commands/discord/UnavailableCelError');
const User = require('../../../src/models/User');
const { readRawFixture, fixturePath } = require('../../Utils');

describe('TicTacToe', async () => {
  let game, user1, user2;

  beforeEach(async () => {
    user1 = await User.query().insertAndFetch({ displayName: 'user1' });
    user2 = await User.query().insertAndFetch({ displayName: 'user2' });
    game = TicTacToe.newGame(user1, user2);
  });

  afterEach(() => TicTacToe.resetGames());

  describe('new game', async () => {
    it('assigns the players', async () => {
      expect(game.player1).to.equal(user1.id);
      expect(game.player2).to.equal(user2.id);
    });

    it('initializes the board', async () => {
      expect(game.board.length).to.eql(3);
      expect(game.board.find(b => b.length !== 3)).to.be.undefined;
    });

    it('sets user1 as nextPlayer', async () => {
      expect(game.nextPlayer).to.equal(user1.id);
    });

    it('adds to current games', async () => {
      expect(TicTacToe.getGames().length).to.eql(1);
    });
  });

  describe('gameFor', async () => {
    it('returns any game where the user is a player', async () => {
      expect(TicTacToe.gameFor(user1)).to.equal(game);
      expect(TicTacToe.gameFor(user2)).to.equal(game);
    });
  });

  describe('play', async () => {
    it('raises error when coordinates are out of range', async () => {
      const play = () => game.play(user1, 'D1');
      expect(play).to.throw(InvalidMoveError);
    });

    it('raises error when coordinates are invalid', async () => {
      expect(() => game.play(user1, 'SASA')).to.throw(InvalidMoveError);
      expect(() => game.play(user1, '!!')).to.throw(InvalidMoveError);
    });

    describe('when cell is vacant', async () => {
      beforeEach(async () => {
        game.play(user1, 'A2');
      });

      it(`adds the player's move to the position`, async () => {
        expect(game.board[0][1]).to.equal(user1.id);
      });

      it('sets the nextPlayer', async () => {
        expect(game.nextPlayer).to.equal(user2.id);
      });
    });

    describe('playing with lowercase', async () => {
      beforeEach(async () => {
        game.play(user1, 'a2');
      });

      it(`adds the player's move to the position`, async () => {
        expect(game.board[0][1]).to.equal(user1.id);
      });

      it('sets the nextPlayer', async () => {
        expect(game.nextPlayer).to.equal(user2.id);
      });
    });

    describe('when cell is taken', async () => {
      beforeEach(async () => {
        game.play(user1, 'A2');
      });

      it(`throws an exception`, async () => {
        expect(() => game.play(user2, 'A2')).to.throw(UnavailableCellError);
      });
    });

    describe(`when it's not the player's turn`, async () => {
      beforeEach(async () => {
        game.play(user1, 'A2');
      });

      it('throws an exception', async () => {
        expect(() => game.play(user1, 'A1')).to.throw(NotPlayerTurnError);
      });
    });
  });

  describe('isFinished', async () => {
    it(`is false when there's no winner yet`, async () => {
      game.setBoard([
        'XX ',
        '   ',
        '   ',
      ]);
      expect(game.isFinished()).to.be.false;
    });
  });

  describe('getWinner', async () => {
    it('is true with horizontal match for player1', async () => {
      game.setBoard([
        'XXX',
        '   ',
        '   ',
      ]);
      expect(game.getWinner()).to.eql(user1.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with horizontal match for player2', async () => {
      game.setBoard([
        '   ',
        'OOO',
        '   ',
      ]);
      expect(game.getWinner()).to.eql(user2.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with vertical match for player1', async () => {
      game.setBoard([
        'X  ',
        'XOO',
        'X  ',
      ]);
      expect(game.getWinner()).to.eql(user1.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with vertical match for player2', async () => {
      game.setBoard([
        'XO ',
        'XOO',
        ' O ',
      ]);
      expect(game.getWinner()).to.eql(user2.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with top-down diagonal match for player1', async () => {
      game.setBoard([
        'XO ',
        'OXO',
        'OOX',
      ]);
      expect(game.getWinner()).to.eql(user1.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with top-down diagonal match for player2', async () => {
      game.setBoard([
        'OX ',
        'XOX',
        'XOO',
      ]);
      expect(game.getWinner()).to.eql(user2.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with bottom-up diagonal match for player1', async () => {
      game.setBoard([
        'OOX',
        'OXO',
        'XO ',
      ]);
      expect(game.getWinner()).to.eql(user1.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with bottom-up diagonal match for player2', async () => {
      game.setBoard([
        'XOO',
        'XOX',
        'OX ',
      ]);
      expect(game.getWinner()).to.eql(user2.id);
      expect(game.isFinished()).to.be.true;
    });

    it('is true with a tie', async () => {
      game.setBoard([
        'XOX',
        'XOO',
        'OXX',
      ]);
      expect(game.getWinner()).to.be.null;
      expect(game.isFinished()).to.be.true;
    });
  });

  describe('toCanvas', async () => {
    it('renders the game canvas', async () => {
      game.setBoard([
        'XOX',
        'X O',
        'OXX',
      ]);
      const canvas = game.toCanvas();
      const fs = require('fs');
      const out = fs.createWriteStream(__dirname + '/tictactoe.png');
      const stream = canvas.createPNGStream();

      await new Promise((resolve, reject) => {
        stream.pipe(out)
          .on('error', reject)
          .on('finish', resolve);
      });

      const actual = fs.readFileSync(__dirname + '/tictactoe.png');
      const expected = fs.readFileSync(fixturePath('tictactoe.png'));

      expect(actual).to.matchImage(expected);
    });
  });
});
