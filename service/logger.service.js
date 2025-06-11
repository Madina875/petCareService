const winston = require("winston");
const { combine, timestamp, printf, colorize } = winston.format;
const chalk = require("chalk");

const myFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "HH:mm:ss" }),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

const styles = {
  success: chalk.bgGreen.bgCyanBright.bold,
  warning: chalk.bgYellow.black.bold,
  error: chalk.bgRed.white.bold,
};

logger.portStarted = (port) => {
  logger.info(styles.success(` Server is running on port: ${port}👾 `));
};

module.exports = logger;

/*
Winston – bu Node.js uchun mashhur log yozish kutubxonasi. U quyidagilarni qo‘llab-quvvatlaydi:

Turli log darajalari: error, warn, info, http, verbose, debug, silly

Formatlash: JSON, string, timestamp

Transportlar: log faylga, konsolga, yoki boshqa xizmatlarga yozish

*/
