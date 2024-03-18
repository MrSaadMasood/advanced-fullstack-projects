const jwt = require("jsonwebtoken")
const { OAuth2Client,  UserRefreshClient } = require("google-auth-library")
require("dotenv").config()

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
)
// for the verification of jwt access token
async function authenticateUser(req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader) return res.status(401).json({ error : "failed to authenticate user"})
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
        if(!authHeader) throw new Error 
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
        console.log("the error occured while extracting the tokens", error) 
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
        console.log("failed to refresh the google access token");
        throw new Error 
    }
}
module.exports = {
    authenticateUser,
    factor2RouteTokenAuthenticator,
    googleTokensExtractor,
    refreshGoogleAccessToken
}