var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import post from 'axios';
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { connectData, getData } from "../connection.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { envValidator, generateAccessRefreshTokens } from "../utils/utils.js";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "node:crypto";
import { googleTokensExtractor, refreshGoogleAccessToken } from "../middlewares/middlewares.js";
import { logger } from "../logger/conf/loggerConfiguration.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
const { sign, verify } = jwt
const { ACCESS_SECRET, F2A_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_SECRET } = process.env;
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
let database;
const mongoUrl = process.env.MONGO_URL || "";
connectData((err) => {
    if (!err) {
        database = getData();
    }
});
// based on the validation result the password is hased and the user data is stored in the database
export function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = validationResult(req);
        const { fullName, email, password, isGoogleUser, profilePicture, id } = req.body;
        if (result.isEmpty()) {
            return bcrypt.hash(password, 10, (err, hashedPassword) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return res.status(400).json({ error: "the user could not be created" });
                try {
                    logger.info("password successfully hashed");
                    const user = yield database.collection("users").insertOne({
                        _id: id || randomUUID(),
                        fullName: fullName,
                        email: email,
                        password: hashedPassword,
                        friends: [],
                        receivedRequests: [],
                        sentRequests: [],
                        profilePicture: profilePicture || null,
                        isGoogleUser: isGoogleUser || false,
                        is2FactorAuthEnabled: false
                    });
                    if (!user)
                        throw new Error("failed to add user to the database");
                    return res.json({ message: "user successfully created" });
                }
                catch (error) {
                    return res.status(400).json({ error: "failed to create the user" });
                }
            }));
        }
        else {
            return res.status(400).json({ error: "input error" });
        }
    });
}
// based on the validation result the user is verified and the specific information is projected and sent back
export function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = validationResult(req);
        const { email, password } = req.body;
        try {
            if (result.isEmpty()) {
                const user = yield database.collection("users").findOne({ email: email }, {
                    projection: {
                        fullName: 1,
                        friends: 1,
                        sentRequests: 1,
                        receivedRequests: 1,
                        password: 1,
                        isGoogleUser: 1,
                        is2FactorAuthEnabled: 1
                    },
                });
                if (!user)
                    throw new Error("failed to find the user data from database");
                const match = yield bcrypt.compare(password, user.password);
                if (!match)
                    throw new Error("failed to match the passwords");
                try {
                    const { accessToken, refreshToken } = yield generateAccessRefreshTokens({ id: user._id.toString() }, database);
                    if (user.is2FactorAuthEnabled) {
                        const factor2AuthToken = sign({ email: email }, envValidator(F2A_SECRET, "f2a"), { expiresIn: "5m" });
                        return res.json({
                            factor2AuthToken,
                            refreshToken,
                            is2FactorAuthEnabled: user.is2FactorAuthEnabled,
                            isGoogleUser: user.isGoogleUser
                        });
                    }
                    return res.json({ accessToken, refreshToken, isGoogleUser: user.isGoogleUser, is2FactorAuthEnabled: user.is2FactorAuthEnabled });
                }
                catch (error) {
                    return res.status(404).json({ error: "login failed" });
                }
            }
            else
                throw new Error;
        }
        catch (error) {
            return res.status(404).json({ error: "login input error" });
        }
    });
}
// on token expiration the request is sent from the front end to and the access token is refreshed if the refresh token
// is present in the database of the user
export function refreshUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { refreshToken, isGoogleUser } = req.body;
        try {
            const tokenCheck = yield database.collection("tokens").findOne({ token: refreshToken });
            if (!tokenCheck)
                throw new Error("failed to get the refresh token from database");
            if (isGoogleUser) {
                const credentials = yield refreshGoogleAccessToken(refreshToken);
                return res.json({ newAccessToken: credentials.access_token });
            }
            const data = verify(refreshToken, envValidator(REFRESH_SECRET, "refresh secret"));
            const newAccessToken = sign({ id: data.id }, envValidator(ACCESS_SECRET, "access secret"), { expiresIn: "5m" });
            if (!newAccessToken)
                throw new Error("failed to generate the access token");
            return res.json({ newAccessToken });
        }
        catch (error) {
            return res.status(399).json({ error: "cannot refresh the token" });
        }
    });
}
// on logout the refreshed token is removed from the daatabase
export function logoutUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.body;
        try {
            const deleteToken = yield database.collection("tokens").deleteOne({ token: token });
            if (deleteToken.deletedCount > 0) {
                res.json({ message: "user successfully logged out" });
            }
            else {
                throw new Error("faild to delete the refresh token");
            }
        }
        catch (error) {
            res.status(400).json({ error: "logout failed" });
        }
    });
}
export function googleAuthenticator(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code } = req.body;
        try {
            const tokens = yield googleTokensExtractor(code);
            if (!tokens)
                throw new Error("failed to extract tokends from google code");
            const verifiedToken = yield oAuth2Client.verifyIdToken({
                idToken: tokens.id_token || "",
                audience: GOOGLE_CLIENT_ID
            });
            const payload = verifiedToken.getPayload();
            console.log("the payload extracted from the google function is", payload);
            if (!payload)
                throw new Error("no google payload after token verification");
            const { name, email, picture, at_hash, sub } = payload;
            try {
                const ifUserExists = yield database.collection("users").findOne({ email: email });
                if (!ifUserExists) {
                    try {
                        const userData = {
                            id: sub,
                            fullName: name,
                            email,
                            password: at_hash,
                            profilePicture: picture,
                            isGoogleUser: true
                        };
                        yield post.post(`${process.env.BASE_URL}/auth-user/sign-up`, userData);
                        logger.info("new account for the google user created");
                        yield database.collection("tokens").insertOne({ token: tokens.refresh_token });
                        return res.json(tokens);
                    }
                    catch (error) {
                        throw new Error("failed to create the google user");
                    }
                }
                yield database.collection("tokens").insertOne({ token: tokens.refresh_token });
                if (ifUserExists.is2FactorAuthEnabled) {
                    const factor2AuthToken = sign({ email: email }, envValidator(F2A_SECRET, "f2a"), { expiresIn: "30m" });
                    return res.json({
                        factor2AuthToken,
                        refreshToken: tokens.refresh_token,
                        is2FactorAuthEnabled: ifUserExists.is2FactorAuthEnabled,
                        isGoogleUser: ifUserExists.isGoogleUser
                    });
                }
                const googleTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    is2FactorAuthEnabled: ifUserExists.is2FactorAuthEnabled,
                    isGoogleUser: ifUserExists.isGoogleUser
                };
                return res.json(googleTokens);
            }
            catch (error) {
                throw new Error("failed to create a google user");
            }
        }
        catch (error) {
            return res.status(400).json({ error: "failed to get the google user information" });
        }
    });
}
export function generateOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.user;
        try {
            const user = yield database.collection("users").findOne({ email });
            if (!user)
                throw new Error("failed to find the user to generate otp");
            if (!user.is2FactorAuthEnabled)
                throw new Error("factor 2 authentication is not enabled for the user");
            const secret = authenticator.generateSecret();
            const keyuri = authenticator.keyuri(user.email, "ChatApe", secret);
            const QRcode = yield toDataURL(keyuri);
            yield database.collection("users").updateOne({ email }, { $set: {
                    factor2AuthSecret: secret
                } });
            logger.info("qr code successfully generated");
            return res.status(200).json(QRcode);
        }
        catch (error) {
            return res.status(400).json({ error: "failed to generate the qrcode" });
        }
    });
}
export function verifyOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.user;
        const { otp, refreshToken: refrshTokenBody, isGoogleUser } = req.body;
        const result = validationResult(req);
        try {
            if (result.isEmpty()) {
                const user = yield database.collection("users").findOne({ email });
                if (!user)
                    throw new Error("user not found to verify the otp");
                if (!user.is2FactorAuthEnabled)
                    throw new Error("factor 2 auth not enabled for the user");
                const isCodeVerified = authenticator.check(otp, user.factor2AuthSecret);
                if (!isCodeVerified)
                    throw new Error("failed to verify the given otp");
                if (isGoogleUser) {
                    const credentials = yield refreshGoogleAccessToken(refrshTokenBody);
                    logger.info("google credentials for the user successfully created");
                    return res.json({ accessToken: credentials.access_token, refrshTokenBody, isGoogleUser: true, is2FactorAuthEnabled: true });
                }
                const tokenPayload = { id: user._id.toString() };
                const { accessToken, refreshToken } = yield generateAccessRefreshTokens(tokenPayload, database);
                logger.info("credentials for the normal user successfully created");
                return res.json({ accessToken, refreshToken, isGoogleUser: false, is2FactorAuthEnabled: true });
            }
            else
                throw new Error("verify otp input error");
        }
        catch (error) {
            return res.status(400).json({ error: "failed to complete the 2 factor authentication step" });
        }
    });
}
export function enableF2a(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, isGoogleUser, refreshToken } = req.body;
        const result = validationResult(req);
        try {
            if (result.isEmpty()) {
                yield database.collection("users").updateOne({ email }, { $set: {
                        is2FactorAuthEnabled: true
                    } });
                const factor2AuthToken = sign({ email: email }, envValidator(F2A_SECRET, "f2a"), { expiresIn: "5m" });
                logger.info("factor 2 auth successfully enabled");
                res.json({
                    factor2AuthToken,
                    refreshToken,
                    is2FactorAuthEnabled: true,
                    isGoogleUser
                });
            }
            else
                throw new Error;
        }
        catch (error) {
            res.status(400).json({ error: "failed to enable the factor2 authentication" });
        }
    });
}
export function disableFactor2Auth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield database.collection("users").updateOne({ _id: id }, {
                $set: {
                    is2FactorAuthEnabled: false,
                    factor2AuthSecret: ""
                }
            });
            logger.info("factor 2 auth successfully disabled");
            res.json({ message: "two factor authentication has been successfullly disabled" });
        }
        catch (error) {
            res.status(400).json({ error: "failed to diable the two factor authentication" });
        }
    });
}
