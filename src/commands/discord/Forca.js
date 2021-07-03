const fs = require('fs');
const AlreadyGuessedError = require('./AlreadyGuessedError');

const CHUNK_SIZE = 1000;
const MAX_ERRORS = 5;
const EQUIV = {
  'ç': 'c',
  'ã': 'a',
  'á': 'a',
  'à': 'a',
  'â': 'a',
  'é': 'e',
  'ê': 'e',
  'í': 'i',
  'ó': 'o',
  'ô': 'o',
  'õ': 'o',
  'ú': 'u',
  'ü': 'u',
};

class Forca {
  constructor() {
    this.reset();
  }

  reset() {
    this.running = false;
    this.madeGuess = false;
    this.guessedRight = false;
  }

  pickWord() {
    const fd = fs.openSync('data/palavras.txt', 'r');
    const stats = fs.fstatSync(fd);
    const pos = Math.floor(Math.random() * stats.size);
    const buffer = Buffer.alloc(CHUNK_SIZE);
    const chunks = [];

    let word = null;
    while (!word) {
      fs.readSync(fd, buffer, 0, CHUNK_SIZE, pos);
      const chunk = buffer.toString();
      chunks.push(chunk);

      if ((chunk.match(/\n/g) || []).length > 1) {
        word = chunks.join('').split('\n')[1];
      }
    }

    return word;
  }

  count(char) {
    return this.word.split('').filter(c => this.getEquiv(c) === char).length
  }

  guessWord(word) {
    const guessed = word.split('').map(w => this.getEquiv(w)).join('').toLowerCase();
    const actual = this.word.split('').map(w => this.getEquiv(w)).join('').toLowerCase();

    this.madeGuess = true;
    this.guessedRight = guessed === actual;
  }

  guess(c) {
    if (c.length >= 3) {
      return this.guessWord(c);
    }

    const char = this.getEquiv(c.toLowerCase());
    if (this.hasGuessed(char)) {
      throw new AlreadyGuessedError();
    }

    this.guesses.push(char);

    const count = this.count(char);
    if (count < 1) this.errors.push(char);

    return count;
  }

  getEquiv(c) {
    return EQUIV[c] || c;
  }

  get errorCount() {
    return this.errors.length;
  }

  isFinished() {
    return this.madeGuess || this.isWin() || this.errors.length > MAX_ERRORS;
  }

  hasGuessed(char) {
    return this.guesses.indexOf(this.getEquiv(char)) !== -1;
  }

  isWin() {
    if (this.madeGuess && this.guessedRight) return true;
    if (this.word.split('').find(c => !this.hasGuessed(c)) === undefined) {
      this.reset();
      return true;
    }
    return false;
  }

  displayChar(char) {
    return this.hasGuessed(char) || this.isFinished();
  }

  toString() {
    const chars = this.word.split('');
    return chars.map(c => this.displayChar(c) ? `${c.toUpperCase()} ` : `_ `).join('').trim();
  }

  start(word) {
    this.word = (word || this.pickWord()).toLowerCase();
    this.errors = [];
    this.guesses = [];
    this.running = true;
  }

  isRunning() {
    return this.running;
  }
}

module.exports = Forca;
