import { transports } from "winston"
declare module "winston-daily-rotate-file" {
    export interface DailyRotateFile extends 
        Pick<transports.FileTransportOptions, Exclude<keyof transports.FileTransportOptions, "maxFiles">>{
            datePattern : string,
        }
    interface DailyRotateFileTransportInstance extends transports.FileTransportInstance {
        new (options : DailyRotateFileTransportOptions) : DailyRotateFileTransportOptions
    }
    const DailyRotateFile : DailyRotateFileTransportInstance
}