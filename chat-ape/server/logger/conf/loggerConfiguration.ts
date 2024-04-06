import winston from "winston"
import path from "path"
import DailyRotateFile from "winston-daily-rotate-file"
require("dotenv").config()
require("winston-daily-rotate-file")
const logLevel = process.env.LOGGER_LEVEL || "info"
const { combine, json, timestamp, errors } = winston.format
const loggingFormat = combine(errors({ stack : true }), timestamp(), json())

const fileRotateTransport = (type : string) =>  
    new winston.transports.DailyRotateFile(configBasedOnFileType(type))
const configBasedOnFileType = (type : string) => {

    const logsDirectoryPath = path.join(__dirname, "../logs/")
    return {
        datePattern : "YYYY-MM-DD",
        filename : `${type}-%DATE%.log`,
        dirname : path.join(logsDirectoryPath, type),
        level : type.includes("error") ? "error" : logLevel
    }
}


const logger = winston.createLogger({
    level : logLevel,
    format : loggingFormat,
    transports : [
        fileRotateTransport("combined"),
        fileRotateTransport("error"),
    ],
    exceptionHandlers : [ new winston.transports.File({
        dirname : path.join(__dirname, "../logs/exceptions/"),
        filename : "exceptions.log"
    })],
    rejectionHandlers : [ new winston.transports.File({
        dirname : path.join(__dirname, "../logs/rejections/"),
        filename : "rejections.log"
    })]
})

const serverLogger = winston.createLogger({
    level : logLevel,
    format : loggingFormat,
    transports : [
        new winston.transports.Console(),
        fileRotateTransport("server-error")
    ]
})


export {
    logger,
    serverLogger
}