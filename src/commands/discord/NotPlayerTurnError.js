class NotPlayerTurnError extends Error {
  constructor() {
    super(`It's not your turn`);
  }
}

module.exports = NotPlayerTurnError;
