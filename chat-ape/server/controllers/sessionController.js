const bcrypt = require("bcrypt");
const { authenticator } = require("otplib")
const qrcode = require("qrcode")
const { connectData, getData } = require("../connection");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { generateAccessRefreshTokens } = require("../utils/utils");
const { MongoClient  } = require("mongodb");
const { dataBaseConnectionMaker } = require("./controllerHelpers");
const axios = require("axios")
const { OAuth2Client } = require("google-auth-library");
const { randomUUID } = require("crypto");
const { googleTokensExtractor, refreshGoogleAccessToken } = require("../middlewares/middlewares");
const { logger } = require("../logger/conf/loggerConfiguration")

require("dotenv").config();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
)

let database;
const mongoUrl = process.env.MONGO_URL

connectData((err) => {
    if (!err) {
        database = getData();
    }
});

// based on the validation result the password is hased and the user data is stored in the database
exports.createUser = async (req, res) => {
    const result = validationResult(req);
    const { fullName, email, password, isGoogleUser, profilePicture, id } = req.body;
    if (result.isEmpty()) {
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) return res.status(400).json({ error: "the user could not be created" });
            try {
                logger.info("password successfully hashed")
                const user = await database.collection("users").insertOne({
                    _id : id || randomUUID(),
                    fullName: fullName,
                    email: email,
                    password: hashedPassword,
                    friends: [],
                    receivedRequests: [],
                    sentRequests: [],
                    profilePicture : profilePicture || null,
                    isGoogleUser : isGoogleUser || false,
                    is2FactorAuthEnabled : false
                });

                if (!user) throw new Error("failed to add user to the database");
                return res.json({ message: "user successfully created" });
            } catch (error) {
                res.status(400).json({ error: "failed to create the user" });
            }
        });
    } else {
        logger.error("input error while signing up the user")
        res.status(400).json({ error: "input error" });
    }
};

// based on the validation result the user is verified and the specific information is projected and sent back
exports.loginUser = async (req, res) => {
    const result = validationResult(req);
    const { email, password } = req.body;
    if (result.isEmpty()) {
        try {
            const user = await database.collection("users").findOne(
                { email: email },
                {
                    projection: {
                        fullName: 1,
                        friends: 1,
                        sentRequests: 1,
                        receivedRequests: 1,
                        password: 1,
                        isGoogleUser : 1,
                        is2FactorAuthEnabled : 1
                    },
                }
            );
            if (!user) throw new Error("failed to find the user data from database");
            
            const match = await bcrypt.compare(password, user.password);

            if (!match) throw new Error("failed to match the passwords");
            
            try {

                const { accessToken , refreshToken } = await generateAccessRefreshTokens({ id : user._id }, database)
                if(user.is2FactorAuthEnabled){
                    const factor2AuthToken = jwt.sign({ email : email}, process.env.F2A_SECRET, { expiresIn : "5m" })
                    return res.json({ 
                        factor2AuthToken, 
                        refreshToken, 
                        is2FactorAuthEnabled : user.is2FactorAuthEnabled,
                        isGoogleUser : user.isGoogleUser
                    })
                }
                res.json({ accessToken, refreshToken, isGoogleUser : user.isGoogleUser, is2FactorAuthEnabled : user.is2FactorAuthEnabled });
            } catch (error) {
                logger.error("failed to generate the access and refresh tokens", error)
                res.status(404).json({ error: "login failed" });
            }
        } catch (error) {
            logger.error("login input error", error)
            res.status(404).json({ error: "login input error" });
        }
    }
};

// on token expiration the request is sent from the front end to and the access token is refreshed if the refresh token
// is present in the database of the user
exports.refreshUser = async (req, res) => {
    const { refreshToken, isGoogleUser } = req.body;
    try {
        const tokenCheck = await database.collection("tokens").findOne({ token: refreshToken });

        if (!tokenCheck) throw new Error("failed to get the refresh token from database") 
        if(isGoogleUser){
            const credentials = await refreshGoogleAccessToken(refreshToken)
            return res.json({ newAccessToken : credentials.access_token })
        }
        jwt.verify(refreshToken, process.env.REFRESH_SECRET)

        const newAccessToken = jwt.sign({ id: data.id }, process.env.ACCESS_SECRET, { expiresIn : "5m"});
        if (!newAccessToken) throw new Error("failed to generate the access token");
        res.json({ newAccessToken });

    } catch (error) {
        res.status(399).json({ error: "cannot refresh the token" });
    }
};

// on logout the refreshed token is removed from the daatabase
exports.logoutUser = async (req, res) => {
    const { token } = req.body;
    try {
        const deleteToken = await database.collection("tokens").deleteOne({ token: token });

        if (deleteToken.deletedCount > 0) {
            res.json({ message: "user successfully logged out" });
        } else {
            throw new Error("faild to delete the refresh token");
        }
    } catch (error) {
        res.status(400).json({ error: "logout failed" });
    }
};

exports.googleAuthenticator = async (req, res)=>{
    const { code } = req.body
    try {
        const tokens = await googleTokensExtractor(code)    
        if(!tokens) throw new Error("failed to extract tokends from google code")
        const verifiedToken = await oAuth2Client.verifyIdToken({
            idToken : tokens.id_token,
            audience : process.env.GOOGLE_CLIENT_ID
        })
        const { name , email , picture, at_hash, sub } = verifiedToken.payload 
        try {
            const ifUserExists = await database.collection("users").findOne({ email : email })
            if(!ifUserExists){
                try {
                    const userData = {
                        id : sub,
                        fullName : name,
                        email,
                        password : at_hash,
                        profilePicture : picture,
                        isGoogleUser : true
                    }
                    await axios.post(`${process.env.BASE_URL}/auth-user/sign-up`, userData)
                    logger.info("new account for the google user created")
                    await database.collection("tokens").insertOne({ token : tokens.refresh_token })
                    return res.json(tokens)
                } catch (error) {
                    throw new Error("failed to create the google user")
                }
            }
            await database.collection("tokens").insertOne({ token : tokens.refresh_token })
            if(ifUserExists.is2FactorAuthEnabled){
                const factor2AuthToken = jwt.sign({ email : email}, process.env.F2A_SECRET, { expiresIn : "30m" })
                return res.json({ 
                    factor2AuthToken, 
                    refreshToken : tokens.refresh_token, 
                    is2FactorAuthEnabled : ifUserExists.is2FactorAuthEnabled,
                    isGoogleUser : ifUserExists.isGoogleUser
                })
            }
            const googleTokens = {
                accessToken : tokens.access_token,
                refreshToken : tokens.refresh_token,
                is2FactorAuthEnabled : ifUserExists.is2FactorAuthEnabled,
                isGoogleUser : ifUserExists.isGoogleUser
            }
            res.json(googleTokens)
        } catch (error) {
            throw new Error("failed to create a google user")
        }
    } catch (error) {
        res.status(400).json({ error : "failed to get the google user information" })
    }
}

exports.generateOTP = async (req, res)=>{
    const { email } = req.user
    try {
        const user = await database.collection("users").findOne({ email })
        if(!user) throw new Error("failed to find the user to generate otp")
        if(!user.is2FactorAuthEnabled) throw new Error("factor 2 authentication is not enabled for the user")
        const secret = authenticator.generateSecret()
        const keyuri = authenticator.keyuri(user.email, "ChatApe", secret)
        const QRcode = await qrcode.toDataURL(keyuri)
        await database.collection("users").updateOne(
            { email },
            { $set : {
                factor2AuthSecret : secret 
            }})
        logger.info("qr code successfully generated")
        res.status(200).json(QRcode)
    } catch (error) {
        res.status(400).json({ error : "failed to generate the qrcode"})
    }
} 

exports.verifyOTP = async (req, res)=>{
    const { email } = req.user
    const {otp, refreshToken, isGoogleUser } = req.body
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const user = await database.collection("users").findOne({ email })
            if(!user) throw new Error("user not found to verify the otp")
            if(!user.is2FactorAuthEnabled) throw new Error("factor 2 auth not enabled for the user")
            const isCodeVerified = authenticator.check(otp, user.factor2AuthSecret)
            if(!isCodeVerified) throw new Error("failed to verify the given otp")
            if(isGoogleUser){
                const credentials = await refreshGoogleAccessToken( refreshToken)           
                logger.info("google credentials for the user successfully created")
                return res.json({ accessToken : credentials.access_token , refreshToken, isGoogleUser: true, is2FactorAuthEnabled : true})
            }
        
            const tokenPayload = { id : user._id }
            const { accessToken, refreshToken } = await generateAccessRefreshTokens(tokenPayload, database)
            logger.info("credentials for the normal user successfully created")
            res.json({ accessToken, refreshToken, isGoogleUser : false, is2FactorAuthEnabled : true })
        }
        else 
            throw new Error("verify otp input error")
    } catch (error) {
        res.status(400).json( { error : "failed to complete the 2 factor authentication step"})
    }
}

exports.enableF2a = async (req, res)=>{
    const { email , isGoogleUser, refreshToken } = req.body
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
                const updatedUser = await database.collection("users").updateOne(
                    { email },
                    { $set : { 
                        is2FactorAuthEnabled : true
                    }}
                )
                const factor2AuthToken = jwt.sign({ email : email}, process.env.F2A_SECRET, { expiresIn : "5m" })
                logger.info("factor 2 auth successfully enabled")
                res.json({
                        factor2AuthToken, 
                        refreshToken, 
                        is2FactorAuthEnabled : true,
                        isGoogleUser
                })
        }
        else throw new Error
    } catch (error) {
        res.status(400).json({ error : "failed to enable the factor2 authentication"})
    }
}

exports.disableFactor2Auth = async (req, res) =>{
    try {
        const { id } = req.params
        await database.collection("users").updateOne({ _id : id },
            {
                $set : {
                    is2FactorAuthEnabled : false,
                    factor2AuthSecret : ""
                }
            })
            logger.info("factor 2 auth successfully disabled")
            res.json({ message : "two factor authentication has been successfullly disabled"})
    } catch (error) {
            res.status(400).json({error : "failed to diable the two factor authentication"})
    }
}