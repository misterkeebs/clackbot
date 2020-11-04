class NoUserError extends Error {
  constructor() {
    super(`No user found while adding player to raffle`);
  }
}

module.exports = NoUserError;
