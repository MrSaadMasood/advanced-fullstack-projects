import { Db } from "mongodb";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "./env-variable";

// to generate the access token
async function generateAccessRefreshTokens(user : tokenUser, database : Db ) {
    try {
        if(!ACCESS_SECRET) throw new Error
        if(!REFRESH_SECRET) throw new Error

        const accessToken =  jwt.sign(user, ACCESS_SECRET);
        const refreshToken = jwt.sign(user, REFRESH_SECRET)
        if(!accessToken || !refreshToken) throw new Error
        await database.collection("tokens").insertOne({ token : refreshToken})
        return { accessToken , refreshToken }
    } catch (error) {
        throw new Error("failed to generate the access and refresh tokens")
    }
}

function envValidator(env : string | undefined, envName : string ) {
    if(!env) throw new Error(` ${envName} env value not provided`)
    return env
}

export {
    generateAccessRefreshTokens,
    envValidator
}
