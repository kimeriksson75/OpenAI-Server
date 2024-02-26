const httpStatusCodes = require("./httpStatusCodes");
const BaseError = require("./baseError");

class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = httpStatusCodes.NOT_FOUND;
    this.description = "Not found.";
    this.isOperational = true;
  }
}

class ValidationError extends Error {
  constructor(message = "Bad request.") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = httpStatusCodes.BAD_REQUEST;
    this.description = "Bad request.";
    this.isOperational = true;
  }
}

class InternalServerError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR,
    description = "Not found.",
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = {
  NotFoundError,
  ValidationError,
  InternalServerError,
};
