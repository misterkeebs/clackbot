class NoCodesLeftError extends Error {
  constructor() {
    super(`There are no redeemable codes left`);
  }
}

module.exports = NoCodesLeftError;
