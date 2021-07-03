class AlreadyGuessedError extends Error {
  constructor() {
    super(`Letter already guessed`);
  }
}

module.exports = AlreadyGuessedError;
