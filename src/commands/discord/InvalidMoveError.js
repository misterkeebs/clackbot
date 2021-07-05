class InvalidMoveError extends Error {
  constructor(str = `This move is invalid`) {
    super(str);
  }
}

module.exports = InvalidMoveError;
