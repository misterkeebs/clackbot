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
    this.running = false;
  }

  reset() {
    this.running = false;
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

  guess(c) {
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
    return this.isWin() || this.errors.length > MAX_ERRORS;
  }

  hasGuessed(char) {
    return this.guesses.indexOf(this.getEquiv(char)) !== -1;
  }

  isWin() {
    if (this.word.split('').find(c => !this.hasGuessed(c)) === undefined) {
      this.reset();
      return true;
    }
    return false;
  }

  toString() {
    const chars = this.word.split('');
    return chars.map(c => this.hasGuessed(c) ? `${c.toUpperCase()} ` : `_ `).join('').trim();
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
