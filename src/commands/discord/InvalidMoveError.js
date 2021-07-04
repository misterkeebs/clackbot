class InvalidMoveError extends Error {
  constructor() {
    super(`This move is invalid`);
  }
}

module.exports = InvalidMoveError;
