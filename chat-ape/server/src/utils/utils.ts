import { Db } from "mongodb";
import jwt from "jsonwebtoken";
import env from "../../zodSchema/envSchema";

const { ACCESS_SECRET, REFRESH_SECRET } = env

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
        const accessToken =  jwt.sign(user, ACCESS_SECRET);
        const refreshToken = jwt.sign(user, REFRESH_SECRET)
        if(!accessToken || !refreshToken) throw new Error
        await database.collection("tokens").insertOne({ token : refreshToken})
        return { accessToken , refreshToken }
    } catch (error) {
        throw new Error("failed to generate the access and refresh tokens")
    }
}


function fileValidator(file : Express.Multer.File | undefined){
    if(!file) throw new Error("file not provided")
    return file.filename
}
export {
    generateAccessRefreshTokens,
    fileValidator,
    generalInputValidationError,
    generalErrorMessage,
}
