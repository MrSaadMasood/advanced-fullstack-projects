var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import { OAuth2Client, UserRefreshClient } from "google-auth-library";
import { body, query, param } from "express-validator";
import { logger } from '../logger/conf/loggerConfiguration.js';
import dotenv from "dotenv";
dotenv.config();
const { ACCESS_SECRET, F2A_SECRET, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID } = process.env;
// to validate the incoming string
const stringValidation = (string) => body(string).isString().trim().escape();
const booleanValidation = (value) => body(value).escape().isBoolean();
const queryValidation = (type) => query(type).escape().isString().trim();
const paramValidation = (type) => param(type).escape().isString().trim();
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
// for the verification of jwt access token
function authenticateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.error(new Error("incorrect auth headers provided"));
            return res.status(401).json({ error: "failed to authenticate user" });
        }
        const accessToken = authHeader.split(" ")[1];
        const isGoogleUser = req.headers["isgoogleuser"];
        if (isGoogleUser) {
            try {
                const verifiedToken = yield oAuth2Client.getTokenInfo(accessToken);
                req.user = { id: verifiedToken.sub || "" };
                return next();
            }
            catch (error) {
                return res.status(401).json({ error: "failed to authenticate user" });
            }
        }
        if (!ACCESS_SECRET)
            throw new Error("access secret env not set");
        jwt.verify(accessToken, ACCESS_SECRET, (err, user) => {
            if (err)
                return res.status(401).json({ error: "failed to authenticate user" });
            req.user = user;
            return next();
        });
    });
}
function factor2RouteTokenAuthenticator(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                throw new Error("auth headers not provided for factor 2 authentication");
            const intermediaryToken = authHeader.split(" ")[1];
            if (!F2A_SECRET)
                throw new Error("F2A secret env not set");
            const user = jwt.verify(intermediaryToken, F2A_SECRET);
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ error: "failed to authenticate the intermediary path" });
        }
    });
}
function googleTokensExtractor(code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tokens } = yield oAuth2Client.getToken(code);
            return tokens;
        }
        catch (error) {
            throw new Error("failed to extract the google tokens");
        }
    });
}
function refreshGoogleAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userRefresh = new UserRefreshClient(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, refreshToken);
            const { credentials } = yield userRefresh.refreshAccessToken();
            return credentials;
        }
        catch (error) {
            throw new Error("failed to refresh the google access token");
        }
    });
}
export { authenticateUser, factor2RouteTokenAuthenticator, googleTokensExtractor, refreshGoogleAccessToken, stringValidation, booleanValidation, queryValidation, paramValidation };
