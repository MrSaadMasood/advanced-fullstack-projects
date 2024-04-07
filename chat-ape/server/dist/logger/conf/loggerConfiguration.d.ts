import winston from "winston";
import "winston-daily-rotate-file";
declare const logger: winston.Logger;
declare const serverLogger: winston.Logger;
export { logger, serverLogger };
