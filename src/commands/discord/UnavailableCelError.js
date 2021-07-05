class UnavailableCellError extends Error {
  constructor(str = `This cell is already taken`) {
    super(str);
  }
}

module.exports = UnavailableCellError;
