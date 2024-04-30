import { connectData, getData } from "../../connection.js";
import { Db } from "mongodb";
// import { dataBaseConnectionMaker } from "./controllerHelper";
import post from 'axios' 
import redisClient from '../redisClient/redisClient.js' 
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import jwt from "jsonwebtoken";
import { generalErrorMessage, generateAccessRefreshTokens } from "../utils/utils.js";
import { randomUUID } from "node:crypto";
import { googleTokensExtractor, refreshGoogleAccessToken } from "../../src/utils/googleTokenFuncs.js";
import { logger } from "../logger/conf/loggerConfiguration.js";
import { Response } from 'express' 
import bcrypt from "bcrypt"
import { BadRequest } from '../ErrorHandler/customError.js';
import { incomingDataValidationHandler } from './controllerHelper.js';
import { CustomRequest } from '../Types/customRequest.js';
import env from '../zodSchema/envSchema.js';
import oAuth2Client from '../utils/oAuth2Client.js';
import { userSchema, tokenSchema } from "../zodSchema/zodSchemas.js";

const { ACCESS_SECRET, F2A_SECRET, GOOGLE_CLIENT_ID, REFRESH_SECRET, BASE_URL } = env

const { sign, verify } = jwt

let database: Db;

connectData((err) => {
    if (!err) {
        database = getData();
    }
});

// based on the validation result the password is hased and the user data is stored in the database
export const createUser  = async (req : CustomRequest, res : Response) => {
    incomingDataValidationHandler(req)
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    const { fullName, email, password, isGoogleUser, profilePicture, id }  = req.body;
    const hashedPassword = await bcrypt.hash(password, 10) 
    logger.info("password successfully hashed")
     
    const user = {
        _id : id || randomUUID(),
        fullName: fullName,
        email: email,
        password: hashedPassword,
        friends: [],
        receivedRequests: [],
        sentRequests: [],
        profilePicture : profilePicture || null,
        isGoogleUser : isGoogleUser || false,
        is2FactorAuthEnabled : false,
        factor2AuthSecret : "",
        normalChats : [],
        groupChats : [],
    } 
    userSchema.parse(user)
    const createdUser = await database.collection<DocumentInput>("users").insertOne(user);

    if (!createdUser.acknowledged) throw new BadRequest(generalErrorMessage("failed to create a new user"));

    const ifUsersCached = await redisClient.exists("users")
     
    if (ifUsersCached) await redisClient.call("json.arrappend", "users", "$", JSON.stringify({
        _id : user._id,
        fullName,
        profilePicture : user.profilePicture
    }))
    return res.json({ message: "user successfully created" });
}

// based on the validation result the user is verified and the specific information is projected and sent back
export const loginUser  = async (req : CustomRequest, res : Response) => {
    const { email, password } = req.body;
    // incomingDataValidationHandler(req)
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    const userFromDatabase = await database.collection<CreateNewUser>("users").findOne({ email: email });
    const user = userSchema.parse(userFromDatabase)
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequest(generalErrorMessage("password do not match"));
    const { accessToken , refreshToken } = await generateAccessRefreshTokens({ id : user._id.toString() }, database)
    if(user.is2FactorAuthEnabled){
        const factor2AuthToken = sign({ email : email}, F2A_SECRET, { expiresIn : "5m" })
        return res.json({ 
            factor2AuthToken, 
            refreshToken, 
            is2FactorAuthEnabled : user.is2FactorAuthEnabled,
            isGoogleUser : user.isGoogleUser
        })
    }
    return res.json({ 
        accessToken, 
        refreshToken, 
        isGoogleUser : user.isGoogleUser, 
        is2FactorAuthEnabled : user.is2FactorAuthEnabled });
    }

// on token expiration the request is sent from the front end to and the access token is refreshed if the refresh token
// is present in the database of the user
export const refreshUser  = async (req : CustomRequest, res : Response) => {
    const { refreshToken, isGoogleUser } = req.body;
    incomingDataValidationHandler(req)
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")

    const tokenCheck = await database.collection("tokens").findOne({ token: refreshToken });
    tokenSchema.parse(tokenCheck) 
    if(isGoogleUser){
        const credentials = await refreshGoogleAccessToken(refreshToken)
        return res.json({ newAccessToken : credentials.access_token })
    }
    const data = verify(refreshToken, REFRESH_SECRET ) as JWTTokenPayload
    if(!data) throw new BadRequest(generalErrorMessage("failed to refresh the user"))
    const newAccessToken = sign({ id: data.id }, ACCESS_SECRET, { expiresIn : "5m"});
    if (!newAccessToken) throw new BadRequest({ message : "Bad Request", statusCode : 399});
    
    return res.json({ newAccessToken });

}

// on logout the refreshed token is removed from the daatabase
export const logoutUser  = async (req : CustomRequest, res : Response) => {
    const { refreshToken } = req.body;
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "" )
    const deleteToken = await database.collection("tokens").deleteOne({ token: refreshToken });

    if (deleteToken.deletedCount) {
        res.json("user successfully logged out");
    } else {
        throw new BadRequest(generalErrorMessage("faild to delete the refresh token"));
    }
}

export const googleAuthenticator  = async (req : CustomRequest, res : Response) => {
    const { code }  = req.body
    const decodedCode = decodeURIComponent(code) 
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    const tokens = await googleTokensExtractor(decodedCode)    
    if(!tokens) throw new Error("failed to extract tokends from google code")
    const verifiedToken = await oAuth2Client.verifyIdToken({
        idToken : tokens.id_token || "",
        audience : GOOGLE_CLIENT_ID 
    })
    const payload = verifiedToken.getPayload()
    if(!payload) throw new Error("no google payload after token verification")
    const { name , email , picture, at_hash, sub } = payload

    const ifUserExists = await database.collection("users").findOne<CreateNewUser>({ email : email })

    if(!ifUserExists){
        const userData = {
            id : sub,
            fullName : name,
            email,
            password : at_hash,
            profilePicture : picture,
            isGoogleUser : true
        }
        
        await post.post(`${BASE_URL}/auth-user/sign-up`, userData)
        logger.info("new account for the google user created")
        await database.collection("tokens").insertOne({ token : tokens.refresh_token })
        return res.json(tokens)
    }
    await database.collection("tokens").insertOne({ token : tokens.refresh_token })
    if(ifUserExists.is2FactorAuthEnabled){
        const factor2AuthToken = sign({ email : email}, F2A_SECRET, { expiresIn : "30m" })
        return res.json({ 
            factor2AuthToken, 
            refreshToken : tokens.refresh_token, 
            is2FactorAuthEnabled : true,
            isGoogleUser : ifUserExists.isGoogleUser
        })
    }
    const googleTokens = {
        accessToken : tokens.access_token,
        refreshToken : tokens.refresh_token,
        is2FactorAuthEnabled : ifUserExists.is2FactorAuthEnabled,
        isGoogleUser : ifUserExists.isGoogleUser
    }
    return res.json(googleTokens)
}

export const generateOTP  = async (req : CustomRequest, res : Response) => {
    const { email } = req.user!
    
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    const userFromDatabase = await database.collection("users").findOne<CreateNewUser>({ email })
    const user = userSchema.parse(userFromDatabase) 
    if(!user.is2FactorAuthEnabled) throw new Error("factor 2 authentication is not enabled for the user")
    const secret = authenticator.generateSecret()
    const keyuri = authenticator.keyuri(user.email, "ChatApe", secret)
    const QRcode = await toDataURL(keyuri)
    await database.collection("users").updateOne(
        { email },
        { $set : {
            factor2AuthSecret : secret 
        }})
    logger.info("qr code successfully generated")
    return res.status(200).json(QRcode)
} 

export const verifyOTP = async (req : CustomRequest, res : Response) => {
    const { email } = req.user!
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    const {otp, refreshToken : refrshTokenBody } = req.body
    incomingDataValidationHandler(req)
    const userFromDatabase = await database.collection("users").findOne<CreateNewUser>({ email })
    const user = userSchema.parse(userFromDatabase) 
    if(!user.is2FactorAuthEnabled) throw new Error("factor 2 auth not enabled for the user")
    const isCodeVerified = authenticator.check(otp, user.factor2AuthSecret)

    if(!isCodeVerified) throw new Error("failed to verify the given otp")
    if(user.isGoogleUser){
        
        const credentials = await refreshGoogleAccessToken(refrshTokenBody)           
        logger.info("google credentials for the user successfully created")
        return res.json({ 
            accessToken : credentials.access_token ,
            refreshToken : refrshTokenBody, 
            isGoogleUser: true, 
            is2FactorAuthEnabled : true
        })
    }

    const tokenPayload = { id : user._id.toString() }
    const { accessToken, refreshToken } = await generateAccessRefreshTokens(tokenPayload, database)
    logger.info("credentials for the normal user successfully created")
    return res.json({ accessToken, refreshToken, isGoogleUser : false, is2FactorAuthEnabled : true })
}

export const enableF2a  = async (req : CustomRequest, res : Response) => {
    const { email } = req.body
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    incomingDataValidationHandler(req)
    await database.collection("users").updateOne(
        { email },
        { $set : { 
            is2FactorAuthEnabled : true
        }}
    )
    const factor2AuthToken = sign({ email : email}, F2A_SECRET , { expiresIn : "5m" })
    logger.info("factor 2 auth successfully enabled")
    res.json({
        factor2AuthToken, 
        is2FactorAuthEnabled : true,
    })
}

export const disableFactor2Auth  = async  (req : CustomRequest, res : Response) => {
    const { id } = req.params
    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")
    await database.collection<DocumentInput>("users").updateOne({ _id : id},
        {
            $set : {
                is2FactorAuthEnabled : false,
                factor2AuthSecret : ""
            }
        })
        logger.info("factor 2 auth successfully disabled")
        res.json( "two factor authentication has been successfullly disabled" )
}