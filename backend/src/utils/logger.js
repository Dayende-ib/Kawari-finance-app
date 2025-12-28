const { createLogger, format, transports } = require('winston');

const level =
  process.env.LOG_LEVEL ||
  process.env.DEBUG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
