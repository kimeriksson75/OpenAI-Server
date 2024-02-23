const logger = require("pino")();

const timeoutHandler = (req, res, next) => {
  if (!req.timedout) next();
  logger.error("Request Timeout");
  res.status(408).json({ message: "Request Timeout" });
};

module.exports = timeoutHandler;
