import { ErrorRequestHandler } from "express";
import { BadRequest } from "../ErrorHandler/customError.js";
import { logger } from "../logger/conf/loggerConfiguration.js";

export const errorMiddleware : ErrorRequestHandler = (err, _req, res, _next) => {

    if (err instanceof BadRequest) {
        logger.error(err.stack)
        return res.status(err.getStatusCode()).json(err.getErrorMessage());
    }
    logger.error(err.stack)
    return res.status(501).json("Internal Server Error")
}