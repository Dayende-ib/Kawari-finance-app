const { createLogger, format, transports } = require('winston');

const level = process.env.DEBUG_LEVEL || 'info';

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
