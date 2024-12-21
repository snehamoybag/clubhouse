class CustomBadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "BadRequestError";
  }
}

module.exports = CustomBadRequestError;
