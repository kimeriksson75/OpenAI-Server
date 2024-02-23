const logger = require("pino")();

const errorHandler = (err, req, res, next) => {
  const { statusCode = null, message = null } = err;
  if (statusCode && message) {
    logger.error({ statusCode, message });
    logger.error(
      `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}}`
    );
  }

  return res
    .status(statusCode || 500)
    .json({ message: message || "Internal Server Error" });
};

module.exports = errorHandler;
