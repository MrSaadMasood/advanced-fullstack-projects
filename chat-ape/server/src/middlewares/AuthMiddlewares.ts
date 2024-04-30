import jwt from "jsonwebtoken"
import { body, query, param } from "express-validator"
import { logger } from '../logger/conf/loggerConfiguration.js' 
import { Response, NextFunction } from 'express'
import { CustomRequest } from "../Types/customRequest"
import oAuth2Client from "../utils/oAuth2Client.js"
import env from "../zodSchema/envSchema.js"
import { BadRequest } from "../ErrorHandler/customError.js"

const { ACCESS_SECRET, F2A_SECRET } = env

// to validate the incoming string
const stringValidation  = (string : string)=> body(string).isString().trim().escape()
const booleanValidation = (value : string) => body(value).escape().isBoolean()
const queryValidation = (type : string ) => query(type).escape().isString().trim()
const paramValidation = (type : string) => param(type).escape().isString().trim()

// for the verification of jwt access token
async function authenticateUser(req : CustomRequest, res : Response, next : NextFunction){
    const authHeader = req.headers.authorization
    if(!authHeader) {
        logger.error(new Error("incorrect auth headers provided"))
        return res.status(401).json({ error : "failed to authenticate user"})
    }
    const accessToken = authHeader.split(" ")[1]
    const isGoogleUser = req.headers["isgoogleuser"]
    if(isGoogleUser){
        try {
            const verifiedToken = await oAuth2Client.getTokenInfo(accessToken)
            req.user = { id: verifiedToken.sub || "" }
            return next()
        } catch (error) {
            return res.status(401).json({ error : "failed to authenticate user"})
        }
    }
    if(!ACCESS_SECRET) throw new Error("access secret env not set")
    jwt.verify(accessToken, ACCESS_SECRET, (err : any, user : any) =>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        return next()
    }) 
}

async function factor2RouteTokenAuthenticator(req : CustomRequest, _res : Response, next : NextFunction){
        const authHeader = req.headers.authorization
        if(!authHeader) throw new BadRequest({ message : "intermediary user verification failed", statusCode : 401}) 
        const intermediaryToken = authHeader.split(" ")[1]
        const user = jwt.verify(intermediaryToken, F2A_SECRET) 
        req.user = user as JWTTokenPayload
        next()
}

export {
    authenticateUser,
    factor2RouteTokenAuthenticator,
    stringValidation,
    booleanValidation,
    queryValidation,
    paramValidation
}