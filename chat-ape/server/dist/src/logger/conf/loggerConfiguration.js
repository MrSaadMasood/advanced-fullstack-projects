import winston from "winston";
import path from "path";
import "winston-daily-rotate-file";
import env from "../../zodSchema/envSchema.js";
const { LOGGER_LEVEL = "info" } = env;
const currentWorkingDirectory = process.cwd();
const { combine, json, timestamp, errors } = winston.format;
const loggingFormat = combine(errors({ stack: true }), timestamp(), json());
const fileRotateTransport = (type) => new winston.transports.DailyRotateFile(configBasedOnFileType(type));
const configBasedOnFileType = (type) => {
    const logsDirectoryPath = path.join(currentWorkingDirectory, "/src/logger/logs/");
    return {
        datePattern: "YYYY-MM-DD",
        filename: `${type}-%DATE%.log`,
        dirname: path.join(logsDirectoryPath, type),
        level: type.includes("error") ? "error" : LOGGER_LEVEL
    };
};
const logger = winston.createLogger({
    level: LOGGER_LEVEL,
    format: loggingFormat,
    transports: [
        fileRotateTransport("combined"),
        fileRotateTransport("error"),
    ],
    exceptionHandlers: [new winston.transports.File({
            dirname: path.join(currentWorkingDirectory, "/src/logger/logs/exceptions/"),
            filename: "exceptions.log"
        })],
    rejectionHandlers: [new winston.transports.File({
            dirname: path.join(currentWorkingDirectory, "/src/logger/logs/rejections/"),
            filename: "rejections.log"
        })]
});
const serverLogger = winston.createLogger({
    level: LOGGER_LEVEL,
    format: loggingFormat,
    transports: [
        new winston.transports.Console(),
        fileRotateTransport("server-error")
    ]
});
export { logger, serverLogger };
