import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { loggerEnv } from './logger.config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

const createFileTransports = (): winston.transport[] => {
  if (!loggerEnv.LOG_FILE_ENABLED) {
    return [];
  }

  const errorFileTransport = new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    handleExceptions: true,
    handleRejections: true,
    maxFiles: loggerEnv.LOG_MAX_FILES,
    maxSize: loggerEnv.LOG_MAX_SIZE,
    format: fileFormat,
  });

  const combinedFileTransport = new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: loggerEnv.LOG_MAX_FILES,
    maxSize: loggerEnv.LOG_MAX_SIZE,
    format: fileFormat,
  });

  return [errorFileTransport, combinedFileTransport];
};

const transports: winston.transport[] = [consoleTransport, ...createFileTransports()];

export const logger = winston.createLogger({
  level: loggerEnv.LOG_LEVEL,
  levels,
  transports,
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
});

export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
