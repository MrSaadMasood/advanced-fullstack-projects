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
import dotenv from "dotenv";
dotenv.config();
const { ACCESS_SECRET, REFRESH_SECRET } = process.env;
// to generate the access token
function generateAccessRefreshTokens(user, database) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = jwt.sign(user, envValidator(ACCESS_SECRET, "access secret"));
            const refreshToken = jwt.sign(user, envValidator(REFRESH_SECRET, "refresh secret"));
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
function envValidator(env, envName) {
    if (!env)
        throw new Error(` ${envName} env value not provided`);
    return env;
}
export { generateAccessRefreshTokens, envValidator };
