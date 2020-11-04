class NotEnoughBonusError extends Error {
  constructor() {
    super(`The user doesn't have enough bonus`);
  }
}

module.exports = NotEnoughBonusError;
