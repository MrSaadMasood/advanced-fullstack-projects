import { NextFunction, Request, Response } from "express"

export const imageHandlerMiddleware = (propertyName : string) => {
    return ( req : Request , _res : Response , next : NextFunction) => {
        Object.defineProperty(req, propertyName , { value : true })
        next()
    }
}