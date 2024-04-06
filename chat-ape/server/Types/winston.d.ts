import { FileTransportOptions } from "winston/lib/winston/transports";

declare module "winston-daily-rotate-file" {
    import { transports } from "winston"
    interface DailyRotateFileTransportOptions extends 
        Pick<transports.FileTransportOptions, Exclude<keyof transports.FileTransportOptions, "maxFiles">>{
            datePattern : string,
        }
    interface DailyRotateFileTransportInstance extends transports.FileTransportInstance {
        new (options : DailyRotateFileTransportOptions) : DailyRotateFileTransportOptions
    }
    const DailyRotateFile : DailyRotateFileTransportInstance
    export = DailyRotateFile
}