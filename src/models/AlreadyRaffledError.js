class AlreadyRaffledError extends Error {
  constructor() {
    super(`The raffle already ran`);
  }
}

module.exports = AlreadyRaffledError;
