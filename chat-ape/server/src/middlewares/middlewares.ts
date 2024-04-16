import jwt from "jsonwebtoken"
import { OAuth2Client, UserRefreshClient } from "google-auth-library"
import { body, query, param } from "express-validator"
import { logger } from '../logger/conf/loggerConfiguration' 
import { Response, NextFunction } from 'express' 
import dotenv from "dotenv"
import { CustomRequest } from "../../Types/customRequest"
dotenv.config()
const { ACCESS_SECRET, F2A_SECRET, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID } = process.env

// to validate the incoming string
const stringValidation  = (string : string)=> body(string).isString().trim().escape()
const booleanValidation = (value : string) => body(value).escape().isBoolean()
const queryValidation = (type : string ) => query(type).escape().isString().trim()
const paramValidation = (type : string) => param(type).escape().isString().trim()
console.log("the client id ", GOOGLE_CLIENT_ID, "the secret is", GOOGLE_CLIENT_SECRET);

const oAuth2Client = new OAuth2Client({
    clientId : GOOGLE_CLIENT_ID,
    clientSecret : GOOGLE_CLIENT_SECRET,
    redirectUri : "postmessage"
})
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

async function factor2RouteTokenAuthenticator(req : CustomRequest, res : Response, next : NextFunction){
    try {
        const authHeader = req.headers.authorization
        if(!authHeader) throw new Error("auth headers not provided for factor 2 authentication") 
        const intermediaryToken = authHeader.split(" ")[1]
        if(!F2A_SECRET) throw new Error("F2A secret env not set")
        const user = jwt.verify(intermediaryToken, F2A_SECRET) 
        req.user = user as JWTTokenPayload
        next()
    } catch (error) {
        res.status(401).json({error : "failed to authenticate the intermediary path"}) 
    }
}

async function googleTokensExtractor(code : string){
        const { tokens} = await oAuth2Client.getToken(code)
        return tokens
}

async function refreshGoogleAccessToken(refreshToken : string){
        const userRefresh = new UserRefreshClient(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            refreshToken
        )
        const { credentials } = await userRefresh.refreshAccessToken()
        return credentials
}
export {
    authenticateUser,
    factor2RouteTokenAuthenticator,
    googleTokensExtractor,
    refreshGoogleAccessToken,
    stringValidation,
    booleanValidation,
    queryValidation,
    paramValidation
}