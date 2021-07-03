const { expect } = require('chai');
const AlreadyGuessedError = require('../src/commands/discord/AlreadyGuessedError');
const Forca = require('../src/commands/discord/Forca');

describe('Forca', async () => {
  describe('start', async () => {
    it('picks a word', async () => {
      const forca = new Forca();
      expect(forca.word).to.be.undefined;
      forca.start();
      expect(forca.word).to.not.be.null;
    });

    it('sets the running flag', async () => {
      const forca = new Forca();
      expect(forca.running).to.be.false;
      forca.start();
      expect(forca.running).to.be.true;
    });
  });

  describe('guess', async () => {
    describe('when already guessed', async () => {
      let forca;

      beforeEach(async () => {
        forca = new Forca();
        forca.start('AZULA');
        forca.guess('A');
      });

      it('raises an error', async () => {
        expect(() => forca.guess('A')).to.throw(AlreadyGuessedError);
      });
    });

    describe('when guess is valid', async () => {
      let forca, res;

      beforeEach(async () => {
        forca = new Forca();
        forca.start('AZULA');
        res = forca.guess('A');
      });

      it('returns number of matches', async () => {
        expect(res).to.eql(2);
      });

      it('adds to guesses', async () => {
        expect(forca.guesses).to.include('a');
      });

      it('keeps the current errors', async () => {
        expect(forca.errors).to.eql([]);
      });
    });

    describe('when guess is invalid', async () => {
      let forca, res;

      beforeEach(async () => {
        forca = new Forca();
        forca.start('AZUL');
        res = forca.guess('X');
      });

      it('returns false', async () => {
        expect(res).to.eql(0);
      });

      it('adds to guesses', async () => {
        expect(forca.guesses).to.include('x');
      });

      it('adds errors', async () => {
        expect(forca.errors).to.include('x');
      });
    });

    describe('when guessing the word', async () => {
      describe('with the right word', async () => {
        let forca;

        beforeEach(async () => {
          forca = new Forca();
          forca.start('paçoca');
          forca.guess('pacoca');
        });

        it('finishes the game', async () => {
          expect(forca.isFinished()).to.be.true;
        });

        it('marks the game as a win', async () => {
          expect(forca.isWin()).to.be.true;
        });
      });

      describe('with the wrong word', async () => {
        let forca;

        beforeEach(async () => {
          forca = new Forca();
          forca.start('paçoca');
          forca.guess('copaca');
        });

        it('finishes the game', async () => {
          expect(forca.isFinished()).to.be.true;
        });

        it(`doesn't mark the game as a win`, async () => {
          expect(forca.isWin()).to.be.false;
        });
      });
    });
  });

  describe('toString', async () => {
    describe('with no guesses', async () => {
      it('returns the string without guesses', async () => {
        const forca = new Forca();
        forca.start('paçoca');
        expect(forca.toString()).to.eql('_ _ _ _ _ _');
      });
    });

    describe('with one guess', async () => {
      it('returns the guessed character', async () => {
        const forca = new Forca();
        forca.start('paçoca');
        forca.guess('A');
        expect(forca.toString()).to.eql('_ A _ _ _ A');
      });
    });

    describe('with multiple guesses', async () => {
      it('returns the guessed characters', async () => {
        const forca = new Forca();
        forca.start('paçoca');
        forca.guess('a');
        forca.guess('c');
        expect(forca.toString()).to.eql('_ A Ç _ C A');
      });
    });

    describe('when finished and guessed', async () => {
      it('returns all characters', async () => {
        const forca = new Forca();
        forca.start('paçoca');
        forca.guess('acorca');
        expect(forca.toString()).to.eql('P A Ç O C A');
      });
    });
  });

  describe('isFinished', async () => {
    it('is true if errors > 5', async () => {
      const forca = new Forca();
      forca.start();
      forca.errors = [...Array(6)].map((_, i) => i);
      expect(forca.isFinished()).to.be.true;
    });

    it('is true if all the letters were guessed', async () => {
      const forca = new Forca();
      forca.start('paçoca');
      forca.guesses = ['a', 'c', 'o', 'p'];
      expect(forca.isFinished()).to.be.true;
    });
  });

  describe('isWin', async () => {
    it('returns true if all the letters were guessed', async () => {
      const forca = new Forca();
      forca.start('paçoca');
      forca.guesses = ['a', 'c', 'o', 'p'];
      expect(forca.isWin()).to.be.true;
    });

    it('resets the game if won', async () => {
      const forca = new Forca();
      forca.start('paçoca');
      forca.guesses = ['a', 'c', 'o', 'p'];
      expect(forca.isWin()).to.be.true;
      expect(forca.isRunning()).to.be.false;
    });

    it('returns false if not all the letters were guessed', async () => {
      const forca = new Forca();
      forca.start('paçoca');
      forca.guesses = ['a', 'c', 'p'];
      expect(forca.isWin()).to.be.false;
    });
  });
});
