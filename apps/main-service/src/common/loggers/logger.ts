import * as winston from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';
import { v4 } from 'uuid';

const logFormat = winston.format.printf(
  ({
    level,
    message,
    timestamp,
  }: {
    level: string;
    message: string;
    timestamp: string;
  }) => {
    let coloredLevel;
    const requestId = v4();
    switch (level) {
      case 'error':
        coloredLevel = chalk.redBright(level.toUpperCase());
        break;
      case 'warn':
        coloredLevel = chalk.yellowBright(level.toUpperCase());
        break;
      case 'info':
        coloredLevel = chalk.greenBright(level.toUpperCase());
        break;
      case 'debug':
        coloredLevel = chalk.cyanBright(level.toUpperCase());
        break;
      default:
        coloredLevel = chalk.cyanBright(level.toUpperCase());
    }
    return `${chalk.gray(timestamp)} ${coloredLevel}: ${requestId} ${message}`;
  },
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: 'application-%DATE%.info.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
  }),
  new winston.transports.DailyRotateFile({
    filename: 'application-%DATE%.error.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
];

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.ms(),
    logFormat,
  ),
  transports,
});

export { logger };
