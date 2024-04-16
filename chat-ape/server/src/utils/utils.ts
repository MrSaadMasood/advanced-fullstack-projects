import { Db } from "mongodb";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const { ACCESS_SECRET, REFRESH_SECRET } = process.env

const generalInputValidationError = {
    message : "incorrect input provided",
    statusCode : 400
}

const generalErrorMessage = (message : string ) =>{
    return { message }
}
// to generate the access token
async function generateAccessRefreshTokens(user : JWTTokenPayload, database : Db ) {
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

function fileValidator(file : Express.Multer.File | undefined){
    if(!file) throw new Error("file not provided")
    return file.filename
}
export {
    generateAccessRefreshTokens,
    fileValidator,
    envValidator,
    generalInputValidationError,
    generalErrorMessage,
}
