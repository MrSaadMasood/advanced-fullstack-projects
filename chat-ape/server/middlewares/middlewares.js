const jwt = require("jsonwebtoken")
const { OAuth2Client,  UserRefreshClient } = require("google-auth-library")
const { body, query, param } = require("express-validator")
const { logger } = require("../logger/conf/loggerConfiguration")
require("dotenv").config()

// to validate the incoming string
const stringValidation  = (string)=> body(string).isString().trim().escape()
const booleanValidation = (value) => body(value).escape().isBoolean()
const queryValidation = (type) => query(type).escape().isString().trim()
const paramValidation = (type) => param(type).escape().isString().trim()

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
)
// for the verification of jwt access token
async function authenticateUser(req, res, next){
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
            req.user = { id: verifiedToken.sub }
            return next()
        } catch (error) {
            return res.status(401).json({ error : "failed to authenticate user"})
        }
    }
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user)=>{
        if(err) return res.status(401).json({ error : "failed to authenticate user"})
        req.user = user
        next()
    }) 
}

async function factor2RouteTokenAuthenticator(req, res, next){
    try {
        const authHeader = req.headers.authorization
        if(!authHeader) throw new Error("auth headers not provided for factor 2 authentication") 
        const intermediaryToken = authHeader.split(" ")[1]
        const user = jwt.verify(intermediaryToken, process.env.F2A_SECRET) 
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({error : "failed to authenticate the intermediary path"}) 
    }
}

async function googleTokensExtractor(code){
    try {
        const { tokens} = await oAuth2Client.getToken(code)
        return tokens
    } catch (error) {
        throw new Error("failed to extract the google tokens")
    }
}

async function refreshGoogleAccessToken(refreshToken){
    try {
        const userRefresh = new UserRefreshClient(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            refreshToken
        )
        const { credentials } = await userRefresh.refreshAccessToken()
        return credentials
    } catch (error) {
        throw new Error("failed to refresh the google access token")
    }
}
module.exports = {
    authenticateUser,
    factor2RouteTokenAuthenticator,
    googleTokensExtractor,
    refreshGoogleAccessToken,
    stringValidation,
    booleanValidation,
    queryValidation,
    paramValidation
}