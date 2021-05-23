class AlreadyRedeemedError extends Error {
  constructor(nextSlot) {
    super(`The user already redeemed a code`);
    this.nextSlot = nextSlot;
  }
}

module.exports = AlreadyRedeemedError;
