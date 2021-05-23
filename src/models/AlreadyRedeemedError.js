class AlreadyRedeemedError extends Error {
  constructor() {
    super(`The user already redeemed a code`);
  }
}

module.exports = AlreadyRedeemedError;
