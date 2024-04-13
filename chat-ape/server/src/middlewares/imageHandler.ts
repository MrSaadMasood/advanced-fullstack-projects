import { NextFunction, Response } from "express"

export const imageHandlerMiddleware = (propertyName : string) => {
    return ( req : any , _res : Response , next : NextFunction) => {
        req[propertyName] = true
        next()
    }
}