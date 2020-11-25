const { expect } = require('chai');

const Guesses = require('../../src/commands/Guesses');
const guessKeeper = Guesses.getInstance();

describe('Guesses', async () => {
  describe('add', async () => {
    describe('when user had not guessed before', async () => {
      it('sets the guess', async () => {
        guessKeeper.add('felipe', 87);
        expect(guessKeeper.guesses.felipe).to.eql(87);
      });
    });

    describe('when user had already guessed', async () => {
      it('resets the guess', async () => {
        guessKeeper.add('felipe', 87);
        guessKeeper.add('felipe', 8);
        expect(guessKeeper.guesses.felipe).to.eql(8);
      });
    });
  });

  describe('end', async () => {
    beforeEach(async () => {
      guessKeeper.reset();
    });

    it('picks the winner from the one that estimated but not extrapolated first', async () => {
      guessKeeper.add('felipe', 12);
      guessKeeper.add('ronaldo', 78);
      guessKeeper.add('alfredo', 82);
      expect(guessKeeper.getWinner(80)).to.eql('ronaldo');
    });

    it('picks the winner even if it was after', async () => {
      guessKeeper.add('felipe', 12);
      guessKeeper.add('alfredo', 82);
      guessKeeper.add('ronaldo', 78);
      expect(guessKeeper.getWinner(80)).to.eql('ronaldo');
    });

    it('picks the first player on a tie', async () => {
      guessKeeper.add('alfredo', 82);
      guessKeeper.add('ronaldo', 82);
      expect(guessKeeper.getWinner(80)).to.eql('alfredo');
    });
  });
});
