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
const { OAuth2Client, UserRefreshClient } = require("google-auth-library");
const { randomUUID } = require("crypto");
const { googleTokensExtractor, refreshGoogleAccessToken } = require("../middlewares/middlewares");
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

                if (!user) throw new Error;
                return res.json({ message: "user successfully created" });
            } catch (error) {
                res.status(400).json({ error: "input validation failed" });
            }
        });
    } else {
        res.status(400).json({ error: "the user could not be created" });
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
            if (!user) throw new Error;
            
            const match = await bcrypt.compare(password, user.password);

            if (!match) throw new Error;
            
            if(user.is2FactorAuthEnabled){
                const factor2AuthToken = jwt.sign({ email : email}, process.env.F2A_SECRET, { expiresIn : "5m" })
                return res.json({ factor2AuthToken, code : "", is2FactorAuthEnabled : user.is2FactorAuthEnabled })
            }
            try {
                const { accessToken , refreshToken } = await generateAccessRefreshTokens({ id : user._id }, database)
                console.log("the request has reached at the end")
                res.json({ accessToken, refreshToken, isGoogleUser : user.isGoogleUser, is2FactorAuthEnabled : user.is2FactorAuthEnabled });
            } catch (error) {
                res.status(404).json({ error: "login failed" });
            }
        } catch (error) {
            res.status(404).json({ error: "user not found" });
        }
    }
};

// on token expiration the request is sent from the front end to and the access token is refreshed if the refresh token
// is present in the database of the user
exports.refreshUser = async (req, res) => {
    const { refreshToken, isGoogleUser } = req.body;
    try {
        const tokenCheck = await database.collection("tokens").findOne({ token: refreshToken });

        if (!tokenCheck) return res.status(399).json({ error: "cannot refresh the token" });
        console.log("here is the is google user", isGoogleUser)
        if(isGoogleUser){
            const credentials = await refreshGoogleAccessToken(refreshToken)
            return res.json({ newAccessToken : credentials.access_token })
        }
        console.log("the request has reached here", refreshToken)
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, data) => {
            if (err) return res.sendStatus(399);

            const newAccessToken = generateAccessToken({ id: data.id });

            if (!newAccessToken) return res.sendStatus(399);

            res.json({ newAccessToken });
        });
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
            throw new Error;
        }
    } catch (error) {
        res.status(400).json({ error: "logout failed" });
    }
};

exports.googleAuthenticator = async (req, res)=>{
    const { code } = req.body
    try {
        const tokens = await googleTokensExtractor(code)    
        if(!tokens) throw new Error 
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
                    await database.collection("tokens").insertOne({ token : tokens.refresh_token })
                    return res.json(tokens)
                } catch (error) {
                    throw new Error
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
            }
            res.json(googleTokens)
        } catch (error) {
            throw new Error 
        }
    } catch (error) {
        res.status(400).json({ error : "failed to get the google user information" })
    }
}

exports.generateOTP = async (req, res)=>{
    const { email } = req.user
    try {
        const user = await database.collection("users").findOne({ email })
        if(!user) throw new Error
        if(!user.is2FactorAuthEnabled) throw new Error
        const secret = authenticator.generateSecret()
        const keyuri = authenticator.keyuri(user.email, "ChatApe", secret)
        const QRcode = await qrcode.toDataURL(keyuri)
        await database.collection("users").updateOne(
            { email },
            { $set : {
                factor2AuthSecret : secret 
            }})
        res.status(200).json(QRcode )
    } catch (error) {
        res.status(400).json({ error : "failed to generate the qrcode"})
    }
} 

exports.verifyOTP = async (req, res)=>{
    const { email } = req.user
    const {otp, refreshToken, isGoogleUser } = req.body
    try {
        const user = await database.collection("users").findOne({ email })
        if(!user) throw new Error
        if(!user.is2FactorAuthEnabled) throw new Error
        const isCodeVerified = authenticator.check(otp, user.factor2AuthSecret)
        if(!isCodeVerified) throw new Error
        if(isGoogleUser){
            console.log("the refresh token from the fronend is", refreshToken)
            const credentials = await refreshGoogleAccessToken( refreshToken)           
            return res.json({ accessToken : credentials.access_token , refreshToken, isGoogleUser})
        }
    
        const tokenPayload = { id : user._id }
        const { accessToken, refreshToken } = await generateAccessRefreshTokens(tokenPayload, database)
        console.log("the accesstoken and refresh token are", accessToken)
        res.json({ accessToken, refreshToken, isGoogleUser : user.isGoogleUser })
    } catch (error) {
        res.status(400).json( { error : "failed to complete the 2 factor authentication step"})
    }
}