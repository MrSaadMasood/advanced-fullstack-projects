import { NextFunction, Request, Response } from "express"

export const imageHandlerMiddleware = (propertyName : string) => {
    return ( req : Request , _res : Response , next : NextFunction) => {
        console.log('the collectin ids', req.body)
        Object.defineProperty(req, propertyName , { value : true })
        next()
    }
}