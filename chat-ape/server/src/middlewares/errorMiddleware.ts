import { NextFunction, Request, Response } from "express";
import { BadRequest } from "../ErrorHandler/customError";
import { logger } from "../logger/conf/loggerConfiguration";

export const errorMiddleware = (err : Error, _req : Request, res : Response, _next : NextFunction ) => {

    if (err instanceof BadRequest) {
        logger.error(err.stack)
        return res.status(err.getStatusCode()).json(err.getErrorMessage());
    }
    logger.error(err.stack)
    return res.status(501).json("Internal Server Error")
}