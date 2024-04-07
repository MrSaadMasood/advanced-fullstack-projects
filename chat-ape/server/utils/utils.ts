import { Db } from "mongodb";
import jwt from "jsonwebtoken";
const { ACCESS_SECRET, REFRESH_SECRET } = process.env

// to generate the access token
async function generateAccessRefreshTokens(user : tokenUser, database : Db ) {
    try {
        const accessToken =  jwt.sign(user, envValidator(ACCESS_SECRET, "access secret"));
        const refreshToken = jwt.sign(user, envValidator(REFRESH_SECRET, "refresh secret"))
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
