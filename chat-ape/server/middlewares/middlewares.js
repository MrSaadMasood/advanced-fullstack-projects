const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")

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


module.exports = {
    authenticateUser
}