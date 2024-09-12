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
import env from "../zodSchema/envSchema.js";
const { ACCESS_SECRET, REFRESH_SECRET } = env;
const generalInputValidationError = {
    message: "incorrect input provided",
    statusCode: 400
};
const generalErrorMessage = (message) => {
    return { message };
};
// to generate the access token
function generateAccessRefreshTokens(user, database) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = jwt.sign(user, ACCESS_SECRET);
            const refreshToken = jwt.sign(user, REFRESH_SECRET);
            if (!accessToken || !refreshToken)
                throw new Error;
            yield database.collection("tokens").insertOne({ token: refreshToken });
            return { accessToken, refreshToken };
        }
        catch (error) {
            throw new Error("failed to generate the access and refresh tokens");
        }
    });
}
function fileValidator(file) {
    if (!file)
        throw new Error("file not provided");
    return file.filename;
}
export { generateAccessRefreshTokens, fileValidator, generalInputValidationError, generalErrorMessage, };
